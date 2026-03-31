// ─── GigShield Premium Engine ─────────────────────────────────────────────
// Dynamic weekly premium based on 34-year IMD historical data patterns

const CITY_CONFIG = {
  mumbai:    { base: 100, risk: 'high',   multiplier: 1.4, median_hourly: 65 },
  delhi:     { base: 85,  risk: 'medium', multiplier: 1.2, median_hourly: 60 },
  bangalore: { base: 80,  risk: 'medium', multiplier: 1.1, median_hourly: 58 },
  chennai:   { base: 95,  risk: 'high',   multiplier: 1.3, median_hourly: 62 },
  pune:      { base: 65,  risk: 'low',    multiplier: 0.9, median_hourly: 55 },
  default:   { base: 80,  risk: 'medium', multiplier: 1.0, median_hourly: 58 },
};

// IMD historical seasonal risk index (month 0–11)
const SEASONAL_FACTOR = {
  0: 0.7, 1: 0.7, 2: 0.8, 3: 0.9, 4: 0.9,
  5: 1.3, 6: 1.5, 7: 1.5, 8: 1.3, 9: 1.0,
  10: 0.8, 11: 0.7,
};

/**
 * Calculate weekly premium for a worker
 * @param {string} city
 * @param {number} trustWeek - worker's current trust week
 * @returns {{ weekly_premium, zone_risk, city_median_hourly, seasonal_factor, zone_multiplier }}
 */
function calculatePremium(city, trustWeek = 1) {
  const cfg     = CITY_CONFIG[city?.toLowerCase()] || CITY_CONFIG.default;
  const seasonal = SEASONAL_FACTOR[new Date().getMonth()];
  // Loyalty discount: longer-tenured workers get slight premium reduction
  const loyaltyDiscount = trustWeek >= 9 ? 0.95 : trustWeek >= 5 ? 0.97 : 1.0;

  const raw = cfg.base * cfg.multiplier * seasonal * loyaltyDiscount;
  const weekly_premium = Math.round(Math.min(Math.max(raw, 60), 120));

  return {
    weekly_premium,
    zone_risk: cfg.risk,
    city_median_hourly: cfg.median_hourly,
    seasonal_factor: seasonal,
    zone_multiplier: cfg.multiplier,
  };
}

/**
 * Progressive trust model — prevents self-declaration fraud
 */
function getVerifiedHourlyRate(declaredRate, trustWeek, cityMedian) {
  const pct     = trustWeek >= 9 ? 0.9 : trustWeek >= 5 ? 0.7 : 0.5;
  const raw     = declaredRate * pct;
  const floor   = cityMedian * 0.5;
  const ceiling = cityMedian * 1.5;
  return Math.round(Math.min(Math.max(raw, floor), ceiling) * 100) / 100;
}

/**
 * Final payout calculation
 */
function calculatePayout(verifiedRate, hours, severityMultiplier) {
  const cappedHours = Math.min(Math.max(hours, 0), 8);
  return Math.round(verifiedRate * cappedHours * severityMultiplier * 100) / 100;
}

module.exports = { calculatePremium, getVerifiedHourlyRate, calculatePayout, CITY_CONFIG };
