const allowed = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

module.exports = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, false);
    if (allowed.length === 0 || allowed.includes(origin))
      return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
};
