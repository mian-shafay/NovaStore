const crypto = require('crypto');

const generateToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hashed };
};

const hashToken = (raw) => {
  return crypto.createHash('sha256').update(raw).digest('hex');
};

module.exports = { generateToken, hashToken };
