const CITY_CONFIG = {
  mumbai:    { base: 100, risk: 'high',   multiplier: 1.4, median_hourly: 65, days_per_year: 35 },
  delhi:     { base: 85,  risk: 'medium', multiplier: 1.2, median_hourly: 60, days_per_year: 25 },
  bangalore: { base: 80,  risk: 'medium', multiplier: 1.1, median_hourly: 58, days_per_year: 20 },
  chennai:   { base: 95,  risk: 'high',   multiplier: 1.3, median_hourly: 62, days_per_year: 30 },
  pune:      { base: 65,  risk: 'low',    multiplier: 0.9, median_hourly: 55, days_per_year: 15 },
  default:   { base: 80,  risk: 'medium', multiplier: 1.0, median_hourly: 58, days_per_year: 20 },
};
const SEASONAL = {0:0.7,1:0.7,2:0.8,3:0.9,4:0.9,5:1.3,6:1.5,7:1.5,8:1.3,9:1.0,10:0.8,11:0.7};
function calculatePremium(city, trustWeek=1) {
  const cfg = CITY_CONFIG[city?.toLowerCase()] || CITY_CONFIG.default;
  const seasonal = SEASONAL[new Date().getMonth()];
  const loyalty = trustWeek>=9?0.95:trustWeek>=5?0.97:1.0;
  const raw = cfg.base * cfg.multiplier * seasonal * loyalty;
  return { weekly_premium: Math.round(Math.min(Math.max(raw,60),120)), zone_risk: cfg.risk, city_median_hourly: cfg.median_hourly, seasonal_factor: seasonal, zone_multiplier: cfg.multiplier, expected_annual_payout: Math.round(cfg.days_per_year*2.5*0.6*cfg.median_hourly), loss_ratio_estimate:'~60%' };
}
function getVerifiedHourlyRate(declared, trustWeek, cityMedian) {
  const pct = trustWeek>=9?0.9:trustWeek>=5?0.7:0.5;
  return Math.round(Math.min(Math.max(declared*pct, cityMedian*0.5), cityMedian*1.5)*100)/100;
}
function calculatePayout(rate, hours, multiplier) {
  return Math.round(rate*Math.min(Math.max(hours,0),8)*multiplier*100)/100;
}
module.exports = { calculatePremium, getVerifiedHourlyRate, calculatePayout, CITY_CONFIG };
