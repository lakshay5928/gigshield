const router  = require('express').Router();
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const auth    = require('../middleware/auth');
const { calculatePremium } = require('../services/premium-calc/premiumEngine');

const SECRET = process.env.JWT_SECRET || 'gigshield_dev_secret';

// ── POST /api/workers/register ─────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { mobile, name, pan, city, ward_id, declared_hourly_rate, platform } = req.body;
    if (!mobile || !name || !city || !ward_id)
      return res.status(400).json({ error: 'mobile, name, city, ward_id are required' });
    if (mobile.length !== 10)
      return res.status(400).json({ error: 'Mobile must be 10 digits' });

    const dup = await pool.query(
      'SELECT id FROM workers WHERE mobile=$1 OR (pan=$2 AND pan IS NOT NULL)',
      [mobile, pan || null]
    );
    if (dup.rows.length) return res.status(409).json({ error: 'Worker already registered' });

    const { rows: [w] } = await pool.query(
      `INSERT INTO workers
         (mobile, name, pan, city, ward_id, declared_hourly_rate, platform, digilocker_verified)
       VALUES ($1,$2,$3,$4,$5,$6,$7,true)
       RETURNING *`,
      [mobile, name, pan || null, city.toLowerCase(), ward_id,
       declared_hourly_rate || 60, platform || 'zepto']
    );

    const premium = calculatePremium(w.city, 1);
    const token   = jwt.sign({ id: w.id, mobile: w.mobile }, SECRET, { expiresIn: '30d' });

    res.status(201).json({ worker: w, weekly_premium: premium, token });
  } catch (err) { next(err); }
});

// ── POST /api/workers/login ────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) return res.status(400).json({ error: 'Mobile required' });

    const { rows } = await pool.query('SELECT * FROM workers WHERE mobile=$1', [mobile]);
    if (!rows.length) return res.status(404).json({ error: 'Worker not found. Please register.' });

    const token = jwt.sign({ id: rows[0].id, mobile: rows[0].mobile }, SECRET, { expiresIn: '30d' });
    res.json({ worker: rows[0], token });
  } catch (err) { next(err); }
});

// ── GET /api/workers/me ────────────────────────────────────────────────────
router.get('/me', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT w.*,
         p.status        AS policy_status,
         p.weekly_premium,
         p.end_date,
         p.id            AS policy_id,
         (SELECT COUNT(*)                FROM claims  WHERE worker_id=w.id AND status='paid')  AS total_claims,
         (SELECT COALESCE(SUM(amount),0) FROM payouts WHERE worker_id=w.id AND status='paid')  AS total_earned
       FROM workers w
       LEFT JOIN policies p ON p.worker_id=w.id AND p.status='active'
       WHERE w.id=$1`,
      [req.worker.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// ── PATCH /api/workers/earnings ────────────────────────────────────────────
router.patch('/earnings', auth, async (req, res, next) => {
  try {
    const { declared_hourly_rate, add_screenshot } = req.body;
    const { rows: [w] } = await pool.query('SELECT * FROM workers WHERE id=$1', [req.worker.id]);

    const screenshots = add_screenshot ? w.verified_screenshots + 1 : w.verified_screenshots;
    const trustWeek   = screenshots >= 3 ? 9 : screenshots >= 1 ? 5 : w.trust_week;

    await pool.query(
      'UPDATE workers SET declared_hourly_rate=$1, verified_screenshots=$2, trust_week=$3 WHERE id=$4',
      [declared_hourly_rate || w.declared_hourly_rate, screenshots, trustWeek, req.worker.id]
    );
    res.json({ message: 'Updated', trust_week: trustWeek, verified_screenshots: screenshots });
  } catch (err) { next(err); }
});

// ── GET /api/workers/all (admin) ───────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM workers ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
