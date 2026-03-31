const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');
const { mockUpiPayout } = require('../mock/razorpayMock');

// ── GET /api/payouts/my ────────────────────────────────────────────────────
router.get('/my', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT py.*, c.disruption_hours, a.alert_level, a.ward_id, a.started_at
       FROM payouts py
       JOIN claims c ON c.id = py.claim_id
       LEFT JOIN alerts a ON a.id = c.alert_id
       WHERE py.worker_id=$1
       ORDER BY py.created_at DESC`,
      [req.worker.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/payouts/summary ───────────────────────────────────────────────
router.get('/summary', auth, async (req, res, next) => {
  try {
    const { rows: [row] } = await pool.query(
      `SELECT
         COUNT(*)                    AS total_payouts,
         COALESCE(SUM(amount),0)     AS total_amount,
         COALESCE(AVG(amount),0)     AS avg_amount,
         MAX(paid_at)                AS last_payout
       FROM payouts
       WHERE worker_id=$1 AND status='paid'`,
      [req.worker.id]
    );
    res.json(row);
  } catch (err) { next(err); }
});

// ── GET /api/payouts/all (admin) ───────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT py.*, w.name, w.mobile, w.city
       FROM payouts py JOIN workers w ON w.id=py.worker_id
       ORDER BY py.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── POST /api/payouts/simulate (demo) ─────────────────────────────────────
router.post('/simulate', async (req, res, next) => {
  try {
    const { claim_id, worker_id, amount } = req.body;
    if (!claim_id || !worker_id || !amount)
      return res.status(400).json({ error: 'claim_id, worker_id, amount required' });

    const upiRef = await mockUpiPayout(amount, worker_id);
    const { rows: [payout] } = await pool.query(
      "INSERT INTO payouts (claim_id, worker_id, amount, status, upi_ref, paid_at) VALUES ($1,$2,$3,'paid',$4,NOW()) RETURNING *",
      [claim_id, worker_id, amount, upiRef]
    );
    await pool.query("UPDATE claims SET status='paid' WHERE id=$1", [claim_id]);

    res.json({ payout, upi_ref: upiRef });
  } catch (err) { next(err); }
});

module.exports = router;
