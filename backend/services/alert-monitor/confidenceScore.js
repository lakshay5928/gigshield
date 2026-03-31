// ─── Hybrid Confidence Score ──────────────────────────────────────────────
// Trigger fires only when score >= 0.65
// Prevents false payouts from coarse IMD district-level data

/**
 * @param {{ imdAlert: string, awsReading: number, crowdsourceCount: number }}
 * @returns {number} 0.0 – 1.0
 */
function calculateConfidence({ imdAlert, awsReading, crowdsourceCount }) {
  let score = 0;

  // IMD District Alert — 0.40 max weight
  const imdScore = { red: 0.40, orange: 0.35, yellow: 0.28, bandh: 0.40, heatwave: 0.35, pollution: 0.30 };
  score += imdScore[imdAlert?.toLowerCase()] || 0.20;

  // Nearest AWS Station reading (mm/hr) — 0.35 max weight
  if (awsReading !== undefined) {
    if (awsReading >= 7.5)      score += 0.35;
    else if (awsReading >= 2.5) score += 0.25;
    else if (awsReading > 0)    score += 0.15;
  }

  // Worker crowdsource reports in last 30 min — 0.25 max weight
  if (crowdsourceCount >= 10)     score += 0.25;
  else if (crowdsourceCount >= 5) score += 0.18;
  else if (crowdsourceCount >= 2) score += 0.10;

  return Math.min(parseFloat(score.toFixed(2)), 1.0);
}

module.exports = { calculateConfidence };
