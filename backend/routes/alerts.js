const router    = require('express').Router();
const pool      = require('../config/db');
const { processAlert }      = require('../services/claim-engine/claimOrchestrator');
const { calculateConfidence } = require('../services/alert-monitor/confidenceScore');

const SEVERITY = {
  yellow: 0.4, orange: 0.7, red: 1.0,
  bandh: 1.0,  heatwave: 0.6, pollution: 0.4,
};

// AWS reading simulation per alert type (mm/hr)
const AWS_SIM = {
  red: 20, orange: 6, yellow: 2,
  bandh: 0, heatwave: 0, pollution: 0,
};

// ── POST /api/alerts/trigger ───────────────────────────────────────────────
router.post('/trigger', async (req, res, next) => {
  try {
    const { ward_id, city, alert_level, source, duration_hours } = req.body;
    if (!ward_id || !city || !alert_level)
      return res.status(400).json({ error: 'ward_id, city, alert_level required' });

    const level      = alert_level.toLowerCase();
    const multiplier = SEVERITY[level] || 0.5;

    // Hybrid confidence score
    const { rows: [{ count: reportCount }] } = await pool.query(
      "SELECT COUNT(*) FROM rain_reports WHERE ward_id=$1 AND reported_at > NOW() - INTERVAL '30 minutes'",
      [ward_id]
    );
    const confidence = calculateConfidence({
      imdAlert: level,
      awsReading: AWS_SIM[level] ?? 3,
      crowdsourceCount: parseInt(reportCount),
    });

    if (confidence < 0.40)
      return res.status(400).json({
        error: `Confidence score ${confidence} below threshold (0.40) — trigger blocked`,
        confidence,
      });

    const started_at = new Date();
    const ended_at   = new Date(started_at.getTime() + (duration_hours || 3) * 3600000);

    const { rows: [alert] } = await pool.query(
      `INSERT INTO alerts
         (source, ward_id, city, alert_level, severity_multiplier, confidence_score, started_at, ended_at, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true)
       RETURNING *`,
      [source || 'imd', ward_id, city.toLowerCase(), level, multiplier, confidence, started_at, ended_at]
    );

    const claimsTriggered = await processAlert(alert);

    res.status(201).json({
      alert,
      claims_triggered: claimsTriggered,
      confidence_score: confidence,
      message: `${level.toUpperCase()} Alert active. ${claimsTriggered} workers notified.`,
    });
  } catch (err) { next(err); }
});

// ── POST /api/alerts/rain-report (crowdsource) ────────────────────────────
router.post('/rain-report', async (req, res, next) => {
  try {
    const { worker_id, ward_id, city } = req.body;
    await pool.query(
      'INSERT INTO rain_reports (worker_id, ward_id, city) VALUES ($1,$2,$3)',
      [worker_id, ward_id, city]
    );
    const { rows: [{ count }] } = await pool.query(
      "SELECT COUNT(*) FROM rain_reports WHERE ward_id=$1 AND reported_at > NOW() - INTERVAL '30 minutes'",
      [ward_id]
    );
    res.json({ reported: true, ward_reports_30min: parseInt(count) });
  } catch (err) { next(err); }
});

// ── GET /api/alerts/active ─────────────────────────────────────────────────
router.get('/active', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM alerts WHERE is_active=true ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/alerts/all ────────────────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 100"
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── PATCH /api/alerts/:id/end ──────────────────────────────────────────────
router.patch('/:id/end', async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE alerts SET is_active=false, ended_at=NOW() WHERE id=$1", [req.params.id]
    );
    res.json({ message: 'Alert ended' });
  } catch (err) { next(err); }
});

module.exports = router;
