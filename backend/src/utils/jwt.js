const jwt = require('jsonwebtoken');

const accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_access';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'dev_refresh';
const accessExp = process.env.JWT_ACCESS_EXPIRES || '15m';
const refreshExp = process.env.JWT_REFRESH_EXPIRES || '7d';

function signTokens(payload) {
  const accessToken = jwt.sign(payload, accessSecret, { expiresIn: accessExp });
  const refreshToken = jwt.sign(payload, refreshSecret, {
    expiresIn: refreshExp,
  });
  return { accessToken, refreshToken };
}

function verifyAccess(token) {
  return jwt.verify(token, accessSecret);
}

function verifyRefresh(token) {
  return jwt.verify(token, refreshSecret);
}

module.exports = { signTokens, verifyAccess, verifyRefresh };
