// ─── GigShield Fraud Detector ─────────────────────────────────────────────
// 3 lightweight signals — no invasive device permissions needed

const deviceRegistry = new Map(); // production: persist in DB/Redis

/**
 * Per-claim fraud check
 * @returns {{ flag: 'GREEN'|'YELLOW'|'RED', score: number, signals: array }}
 */
function detectFraud({ worker_id, gps_accuracy, device_id, claim_time }) {
  const signals = [];
  let score = 0;

  // ── Signal 1: GPS accuracy metadata ─────────────────────────────────────
  // Real outdoor GPS in rain → ±15–30m (fluctuates)
  // Spoofed GPS             → suspiciously perfect ±1–5m (static)
  if (gps_accuracy !== undefined) {
    if (gps_accuracy < 5) {
      signals.push({ type: 'GPS_SPOOFED', detail: `accuracy=${gps_accuracy}m`, weight: 3 });
      score += 3;
    } else if (gps_accuracy < 10) {
      signals.push({ type: 'GPS_SUSPICIOUS', detail: `accuracy=${gps_accuracy}m`, weight: 1 });
      score += 1;
    }
  }

  // ── Signal 2: Device ID consistency ─────────────────────────────────────
  // Same physical device should always map to same worker account
  if (device_id) {
    if (!deviceRegistry.has(device_id)) {
      deviceRegistry.set(device_id, worker_id);
    } else if (deviceRegistry.get(device_id) !== worker_id) {
      signals.push({ type: 'DEVICE_SHARED', detail: `device used by multiple workers`, weight: 3 });
      score += 3;
    }
  }

  // ── Signal 3: Claim timing uniformity ────────────────────────────────────
  // Fraud rings submit all claims within seconds of each other (bot behavior)
  const t = claim_time ? new Date(claim_time) : new Date();
  const ms = t.getMilliseconds();
  if (ms < 50) {
    // Suspiciously round timestamp — bot-submitted
    signals.push({ type: 'TIMING_UNIFORM', detail: `ms=${ms}`, weight: 1 });
    score += 1;
  }

  const flag = score >= 3 ? 'RED' : score >= 1 ? 'YELLOW' : 'GREEN';
  return { flag, score, signals };
}

/**
 * Ward-level density check — catches coordinated fraud rings
 * Genuine disruptions affect 50-90% of workers in a zone simultaneously
 */
function checkWardDensity(claimCount, totalEnrolled, alertLevel) {
  if (totalEnrolled < 3) return 'GREEN'; // too small sample
  const ratio = claimCount / totalEnrolled;

  if (['red', 'orange', 'bandh'].includes(alertLevel?.toLowerCase())) {
    if (ratio < 0.05 && claimCount <= 3) return 'YELLOW'; // suspiciously few
  }
  return 'GREEN';
}

module.exports = { detectFraud, checkWardDensity };
