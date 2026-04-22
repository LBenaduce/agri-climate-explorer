const BadRequestError = require('../errors/BadRequestError');
const {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} = require('../utils/constants');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignup(req, res, next) {
  const {
    name,
    email,
    password,
    marketingConsent,
  } = req.body;

  if (
    typeof name !== 'string'
    || name.trim().length < NAME_MIN_LENGTH
    || name.trim().length > NAME_MAX_LENGTH
  ) {
    return next(new BadRequestError(`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`));
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return next(new BadRequestError('A valid email is required'));
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return next(new BadRequestError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`));
  }

  if (marketingConsent !== undefined && typeof marketingConsent !== 'boolean') {
    return next(new BadRequestError('Marketing consent must be true or false'));
  }

  return next();
}

function validateSignin(req, res, next) {
  const { email, password } = req.body;

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return next(new BadRequestError('A valid email is required'));
  }

  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
    return next(new BadRequestError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`));
  }

  return next();
}

function validateLocation(req, res, next) {
  const {
    city,
    country,
    temperature,
    humidity,
    rainfall,
    wind,
    summary,
    insight,
  } = req.body;

  const hasValidStrings = [city, country, summary, insight].every((value) => typeof value === 'string' && value.trim());
  const hasValidNumbers = [temperature, humidity, rainfall, wind].every((value) => typeof value === 'number' && Number.isFinite(value));

  if (!hasValidStrings || !hasValidNumbers) {
    return next(new BadRequestError('Invalid location payload'));
  }

  return next();
}

function validateWeatherQuery(req, res, next) {
  const { city } = req.query;

  if (typeof city !== 'string' || !city.trim()) {
    return next(new BadRequestError('City is required'));
  }

  return next();
}

module.exports = {
  validateSignup,
  validateSignin,
  validateLocation,
  validateWeatherQuery,
};
