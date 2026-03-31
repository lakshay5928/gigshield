// ─── GigShield Claim Orchestrator ────────────────────────────────────────
// Zero-touch parametric claim processing on alert trigger

const pool = require('../../config/db');
const { getVerifiedHourlyRate, calculatePayout, CITY_CONFIG } = require('../premium-calc/premiumEngine');
const { detectFraud, checkWardDensity } = require('../fraud-detect/fraudDetector');
const { mockUpiPayout } = require('../../mock/razorpayMock');

async function processAlert(alert) {
  // Find all workers with active policies in affected ward
  const { rows: workers } = await pool.query(
    `SELECT w.*, p.id AS policy_id
     FROM workers w
     JOIN policies p ON p.worker_id = w.id AND p.status = 'active'
     WHERE w.ward_id = $1 AND w.city = $2`,
    [alert.ward_id, alert.city]
  );

  let triggered = 0;

  for (const worker of workers) {
    // ── Dedup: skip if claim already exists for this alert ────────────────
    const dup = await pool.query(
      'SELECT id FROM claims WHERE worker_id=$1 AND alert_id=$2',
      [worker.id, alert.id]
    );
    if (dup.rows.length > 0) continue;

    // ── Calculate disruption hours (capped 2–8 hrs) ───────────────────────
    const start = new Date(alert.started_at);
    const end   = alert.ended_at
      ? new Date(alert.ended_at)
      : new Date(start.getTime() + 3 * 3600000);
    const hours = Math.min(Math.max((end - start) / 3600000, 2), 8);

    // ── Payout calculation ────────────────────────────────────────────────
    const cfg          = CITY_CONFIG[worker.city] || CITY_CONFIG.default;
    const verifiedRate = getVerifiedHourlyRate(
      parseFloat(worker.declared_hourly_rate),
      worker.trust_week,
      cfg.median_hourly
    );
    const payout = calculatePayout(verifiedRate, hours, parseFloat(alert.severity_multiplier));

    // ── Fraud detection ───────────────────────────────────────────────────
    const fraud = detectFraud({
      worker_id:    worker.id,
      gps_accuracy: 18 + Math.random() * 14, // simulated real outdoor GPS
      device_id:    worker.id,               // production: real device fingerprint
    });

    // Ward density anomaly check
    const densityFlag = checkWardDensity(triggered + 1, workers.length, alert.alert_level);
    if (densityFlag === 'YELLOW' && fraud.flag === 'GREEN') {
      fraud.flag = 'YELLOW';
      fraud.signals.push({ type: 'WARD_DENSITY_ANOMALY', weight: 1 });
    }

    const claimStatus = fraud.flag === 'RED' ? 'flagged' : 'approved';

    // ── Insert claim ──────────────────────────────────────────────────────
    const { rows: [claim] } = await pool.query(
      `INSERT INTO claims
         (worker_id, policy_id, alert_id, status, flag,
          disruption_hours, hourly_rate_used, severity_multiplier,
          payout_amount, fraud_signals)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        worker.id, worker.policy_id, alert.id, claimStatus, fraud.flag,
        hours, verifiedRate, alert.severity_multiplier,
        payout, JSON.stringify(fraud.signals),
      ]
    );

    // ── Auto-payout for GREEN claims ──────────────────────────────────────
    if (fraud.flag === 'GREEN') {
      const upiRef = await mockUpiPayout(payout, worker.id);
      await pool.query(
        `INSERT INTO payouts (claim_id, worker_id, amount, status, upi_ref, paid_at)
         VALUES ($1,$2,$3,'paid',$4,NOW())`,
        [claim.id, worker.id, payout, upiRef]
      );
      await pool.query("UPDATE claims SET status='paid' WHERE id=$1", [claim.id]);
    }

    triggered++;
  }

  return triggered;
}

module.exports = { processAlert };
