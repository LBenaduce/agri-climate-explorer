const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

function getJwtSecret() {
  const { JWT_SECRET, NODE_ENV = 'development' } = process.env;

  if (JWT_SECRET) {
    return JWT_SECRET;
  }

  if (NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return 'dev-secret';
}

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authorization required'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, getJwtSecret());
    return next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid token'));
  }
};
