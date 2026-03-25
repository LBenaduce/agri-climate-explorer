const ApiError = require('./ApiError');

class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}

module.exports = ConflictError;
