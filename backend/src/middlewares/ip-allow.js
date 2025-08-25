// Restringe acceso por IP a uno o más rangos CIDR (solo producción)

function ipToLong(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => isNaN(n) || n < 0 || n > 255))
    return null;
  return (
    ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3]
  );
}

function cidrToRange(cidr) {
  const [base, maskStr] = cidr.split('/');
  const mask = Number(maskStr || 32);
  const baseLong = ipToLong(base);
  if (baseLong == null || isNaN(mask) || mask < 0 || mask > 32) return null;
  const maskLong = mask === 0 ? 0 : (~0 << (32 - mask)) >>> 0;
  const start = baseLong & maskLong;
  const end = start + (mask === 32 ? 0 : (1 << (32 - mask)) - 1);
  return { start: start >>> 0, end: end >>> 0 };
}

function buildRanges(cidrList) {
  return cidrList
    .map(s => s.trim())
    .filter(Boolean)
    .map(cidrToRange)
    .filter(Boolean);
}

module.exports = function ipAllow(req, res, next) {
  if (process.env.NODE_ENV !== 'production') return next();
  const list = (process.env.LAN_CIDR || '').split(',');
  const ranges = buildRanges(list);
  if (!ranges.length) return next();
  // req.ip puede ser ::ffff:192.168.x.y si hay IPv6 mapped; normalizamos
  const ip = (req.ip || '').replace('::ffff:', '');
  const ipLong = ipToLong(ip);
  if (ipLong == null)
    return res.status(403).json({ message: 'Acceso denegado' });
  const ok = ranges.some(r => ipLong >= r.start && ipLong <= r.end);
  if (!ok) return res.status(403).json({ message: 'Acceso restringido a LAN' });
  return next();
};
