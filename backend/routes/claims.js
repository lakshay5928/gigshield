const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middleware/auth');
const { mockUpiPayout } = require('../mock/razorpayMock');

// ── GET /api/claims/my ─────────────────────────────────────────────────────
router.get('/my', auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*,
         a.alert_level, a.ward_id, a.city, a.started_at AS alert_started,
         py.amount AS paid_amount, py.status AS payout_status, py.paid_at, py.upi_ref
       FROM claims c
       LEFT JOIN alerts  a  ON a.id  = c.alert_id
       LEFT JOIN payouts py ON py.claim_id = c.id
       WHERE c.worker_id=$1
       ORDER BY c.created_at DESC`,
      [req.worker.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/claims/all (admin) ────────────────────────────────────────────
router.get('/all', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, w.name, w.mobile, w.city,
         a.alert_level, a.ward_id,
         py.amount AS paid_amount, py.status AS payout_status, py.upi_ref
       FROM claims c
       JOIN    workers w  ON w.id  = c.worker_id
       LEFT JOIN alerts  a  ON a.id  = c.alert_id
       LEFT JOIN payouts py ON py.claim_id = c.id
       ORDER BY c.created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// ── GET /api/claims/stats ──────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [totals, byFlag, lossRatio] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total_claims,
                    COALESCE(SUM(payout_amount),0) AS total_payout
                  FROM claims`),
      pool.query(`SELECT flag, COUNT(*) AS count FROM claims GROUP BY flag ORDER BY flag`),
      pool.query(`SELECT
                    COALESCE(SUM(py.amount), 0)      AS total_paid,
                    COALESCE(SUM(pol.weekly_premium), 0) AS total_premium
                  FROM payouts py
                  JOIN claims c ON c.id = py.claim_id
                  JOIN policies pol ON pol.id = c.policy_id
                  WHERE py.status='paid'`),
    ]);

    const lr = lossRatio.rows[0];
    const loss_ratio = lr.total_premium > 0
      ? `${((lr.total_paid / lr.total_premium) * 100).toFixed(1)}%`
      : '0%';

    res.json({
      total_claims:  parseInt(totals.rows[0].total_claims),
      total_payout:  parseFloat(totals.rows[0].total_payout),
      by_flag:       byFlag.rows,
      loss_ratio,
    });
  } catch (err) { next(err); }
});

// ── PATCH /api/claims/:id/approve (admin) ─────────────────────────────────
router.patch('/:id/approve', async (req, res, next) => {
  try {
    const { rows: [claim] } = await pool.query(
      "UPDATE claims SET status='approved', flag='GREEN' WHERE id=$1 RETURNING *",
      [req.params.id]
    );
    if (!claim) return res.status(404).json({ error: 'Claim not found' });

    const upiRef = await mockUpiPayout(claim.payout_amount, claim.worker_id);
    await pool.query(
      "INSERT INTO payouts (claim_id, worker_id, amount, status, upi_ref, paid_at) VALUES ($1,$2,$3,'paid',$4,NOW())",
      [claim.id, claim.worker_id, claim.payout_amount, upiRef]
    );
    await pool.query("UPDATE claims SET status='paid' WHERE id=$1", [claim.id]);

    res.json({ message: 'Approved & payout triggered', upi_ref: upiRef });
  } catch (err) { next(err); }
});

// ── PATCH /api/claims/:id/reject (admin) ──────────────────────────────────
router.patch('/:id/reject', async (req, res, next) => {
  try {
    await pool.query("UPDATE claims SET status='rejected' WHERE id=$1", [req.params.id]);
    res.json({ message: 'Claim rejected' });
  } catch (err) { next(err); }
});

module.exports = router;
