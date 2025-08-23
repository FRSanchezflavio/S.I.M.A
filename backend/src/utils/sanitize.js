function sanitizeString(s) {
  if (typeof s !== 'string') return s;
  return s.replace(/[\0\b\t\n\r\x1a"'\\]/g, ' ').trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    out[k] = typeof v === 'string' ? sanitizeString(v) : v;
  }
  return out;
}

module.exports = { sanitizeString, sanitizeObject };
