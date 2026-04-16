function calculateConfidence({ imdAlert, awsReading, crowdsourceCount }) {
  let score = 0;
  const imdScore = { red:0.40,orange:0.35,yellow:0.28,bandh:0.40,heatwave:0.35,pollution:0.30 };
  score += imdScore[imdAlert?.toLowerCase()] || 0.20;
  if (awsReading >= 7.5) score += 0.35;
  else if (awsReading >= 2.5) score += 0.25;
  else if (awsReading > 0) score += 0.15;
  if (crowdsourceCount >= 10) score += 0.25;
  else if (crowdsourceCount >= 5) score += 0.18;
  else if (crowdsourceCount >= 2) score += 0.10;
  return Math.min(parseFloat(score.toFixed(2)), 1.0);
}
module.exports = { calculateConfidence };
