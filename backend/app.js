require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const cron    = require('./services/alert-monitor/alertCron');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true }));

app.use('/api/workers',  require('./routes/workers'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims',   require('./routes/claims'));
app.use('/api/payouts',  require('./routes/payouts'));
app.use('/api/alerts',   require('./routes/alerts'));

app.get('/health', (_, res) =>
  res.json({ status: 'ok', service: 'GigShield API v2.0', ts: new Date() })
);

app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 GigShield backend running on port ${PORT}`));

module.exports = app;
