const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'gigshield_dev_secret';

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized — no token' });
  try {
    req.worker = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
