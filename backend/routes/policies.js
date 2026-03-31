const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');
const { calculatePremium } = require('../services/premium-calc/premiumEngine');

// ── POST /api/policies/create ──────────────────────────────────────────────
router.post('/create', auth, async (req, res, next) => {
  try {
    const { rows: [w] } = await pool.query('SELECT * FROM workers WHERE id=$1', [req.worker.id]);
    if (!w) return res.status(404).json({ error: 'Worker not found' });

    // Cancel existing active policy
    await pool.query("UPDATE policies SET status='cancelled' WHERE worker_id=$1 AND status='active'", [w.id]);

    const p        = calculatePremium(w.city, w.trust_week);
    const start    = new Date();
    const end      = new Date(start); end.setDate(end.getDate() + 7);

    const { rows: [policy] } = await pool.query(
      `INSERT INTO policies (worker_id, status, weekly_premium, zone_risk_multiplier, start_date, end_date)
       VALUES ($1,'active',$2,$3,$4,$5) RETURNING *`,
      [w.id, p.weekly_premium, p.zone_multiplier, start, end]
    );

    res.status(201).json({ policy, premium_details: p });
  } catch (err) { next(err); }
});

// ── GET /api/policies/my ───────────────────────────────────────────────────
router.get('/my', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM policies WHERE worker_id=$1 ORDER BY created_at DESC',
      [req.worker.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/policies/quote?city=mumbai ───────────────────────────────────
router.get('/quote', async (req, res, next) => {
  try {
    res.json(calculatePremium(req.query.city || 'mumbai'));
  } catch (err) { next(err); }
});

// ── GET /api/policies/all (admin) ─────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, w.name, w.mobile, w.city, w.ward_id
       FROM policies p JOIN workers w ON w.id=p.worker_id
       ORDER BY p.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
