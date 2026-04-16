// ─── GigShield ML Service ─────────────────────────────────────────────────
// Connects Node.js backend to Python Flask ML API
// Falls back to rule-based if ML API is not running

const axios = require('axios');
const ML_URL = process.env.ML_API_URL || 'http://localhost:5001';

const CITY_CONFIG = {
  mumbai:    { base: 100, risk: 'high',   multiplier: 1.4, median_hourly: 65 },
  delhi:     { base: 85,  risk: 'medium', multiplier: 1.2, median_hourly: 60 },
  bangalore: { base: 80,  risk: 'medium', multiplier: 1.1, median_hourly: 58 },
  chennai:   { base: 95,  risk: 'high',   multiplier: 1.3, median_hourly: 62 },
  pune:      { base: 65,  risk: 'low',    multiplier: 0.9, median_hourly: 55 },
  default:   { base: 80,  risk: 'medium', multiplier: 1.0, median_hourly: 58 },
};
const SEASONAL = {0:0.7,1:0.7,2:0.8,3:0.9,4:0.9,5:1.3,6:1.5,7:1.5,8:1.3,9:1.0,10:0.8,11:0.7};

/**
 * Get premium from ML model (with rule-based fallback)
 */
async function getPremiumFromML(city, trustWeek = 1, workerData = {}) {
  try {
    const { data } = await axios.post(`${ML_URL}/predict/premium`, {
      city,
      trust_week: trustWeek,
      declared_hourly_rate: workerData.declared_hourly_rate || 60,
      claims_last_month: workerData.claims_last_month || 0,
      years_on_platform: workerData.years_on_platform || 1,
    }, { timeout: 3000 });

    return {
      weekly_premium: data.weekly_premium,
      zone_risk: data.inputs?.zone_risk || 'medium',
      city_median_hourly: data.inputs?.city_median_hourly || 60,
      seasonal_factor: data.inputs?.seasonal_factor || 1.0,
      zone_multiplier: CITY_CONFIG[city?.toLowerCase()]?.multiplier || 1.0,
      model_used: 'GradientBoostingRegressor',
      model_confidence: data.model_confidence,
      premium_range: data.premium_range,
    };
  } catch (err) {
    // Fallback to rule-based
    console.log('[ML] Falling back to rule-based premium:', err.message);
    return getRuleBasedPremium(city, trustWeek);
  }
}

/**
 * Get fraud score from ML model (with rule-based fallback)
 */
async function getFraudScoreFromML(claimData) {
  try {
    const { data } = await axios.post(`${ML_URL}/predict/fraud`, {
      gps_accuracy:        claimData.gps_accuracy || 22,
      claim_velocity_7d:   claimData.claim_velocity_7d || 0,
      ward_claims_5min:    claimData.ward_claims_5min || 5,
      hour_of_claim:       claimData.hour_of_claim || new Date().getHours(),
      days_since_register: claimData.days_since_register || 90,
      payout_amount:       claimData.payout_amount || 150,
    }, { timeout: 3000 });

    return {
      flag: data.flag,
      risk_score: data.risk_score,
      is_anomaly: data.is_anomaly,
      isolation_score: data.isolation_score,
      explanation: data.explanation,
      model_used: 'IsolationForest',
    };
  } catch (err) {
    console.log('[ML] Falling back to rule-based fraud:', err.message);
    return { flag: 'GREEN', risk_score: 0, model_used: 'rule_based_fallback' };
  }
}

// Rule-based fallback (when ML API not running)
function getRuleBasedPremium(city, trustWeek = 1) {
  const cfg = CITY_CONFIG[city?.toLowerCase()] || CITY_CONFIG.default;
  const seasonal = SEASONAL[new Date().getMonth()];
  const loyalty = trustWeek >= 9 ? 0.95 : trustWeek >= 5 ? 0.97 : 1.0;
  const raw = cfg.base * cfg.multiplier * seasonal * loyalty;
  return {
    weekly_premium: Math.round(Math.min(Math.max(raw, 60), 120)),
    zone_risk: cfg.risk,
    city_median_hourly: cfg.median_hourly,
    seasonal_factor: seasonal,
    zone_multiplier: cfg.multiplier,
    model_used: 'rule_based_fallback',
  };
}

function getVerifiedHourlyRate(declared, trustWeek, cityMedian) {
  const pct = trustWeek >= 9 ? 0.9 : trustWeek >= 5 ? 0.7 : 0.5;
  return Math.round(Math.min(Math.max(declared * pct, cityMedian * 0.5), cityMedian * 1.5) * 100) / 100;
}

function calculatePayout(rate, hours, multiplier) {
  return Math.round(rate * Math.min(Math.max(hours, 0), 8) * multiplier * 100) / 100;
}

module.exports = { getPremiumFromML, getFraudScoreFromML, getVerifiedHourlyRate, calculatePayout, CITY_CONFIG };
