const cron = require('node-cron');
const pool = require('../../config/db');
cron.schedule('*/15 * * * *', async () => {
  try {
    const r = await pool.query("UPDATE alerts SET is_active=false WHERE is_active=true AND ended_at < NOW() RETURNING id");
    if (r.rowCount > 0) console.log(`[Cron] Ended ${r.rowCount} alerts`);
  } catch(e) { console.error('[Cron]', e.message); }
});
console.log('[Cron] Alert monitor started');
module.exports = {};
