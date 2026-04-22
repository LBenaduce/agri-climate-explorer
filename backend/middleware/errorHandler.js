const { INVALID_ID_MESSAGE } = require('../utils/constants');

function errorHandler(err, req, res, next) {
  if (err.name === 'CastError') {
    return res.status(400).send({ message: INVALID_ID_MESSAGE });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).send({ message: err.message });
  }

  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? 'Internal server error' : err.message;

  return res.status(statusCode).send({ message });
}

module.exports = errorHandler;