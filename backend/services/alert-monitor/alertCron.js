const cron = require('node-cron');
const pool = require('../../config/db');

// Auto-end expired alerts every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const result = await pool.query(
      "UPDATE alerts SET is_active=false WHERE is_active=true AND ended_at < NOW() RETURNING id"
    );
    if (result.rowCount > 0)
      console.log(`[Cron] Ended ${result.rowCount} expired alerts`);
  } catch (err) {
    console.error('[Cron] Error:', err.message);
  }
});

console.log('[Cron] Alert monitor started — runs every 15 minutes');

module.exports = {};
