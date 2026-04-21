const ApiError = require('./ApiError');

class UnauthorizedError extends ApiError {
  constructor(message = 'Authorization required') {
    super(401, message);
  }
}

module.exports = UnauthorizedError;
