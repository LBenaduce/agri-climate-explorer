const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const { sendNewRegistrationNotification } = require('../utils/email');
const {
  DUPLICATE_EMAIL_MESSAGE,
  INVALID_AUTH_MESSAGE,
  USER_NOT_FOUND_MESSAGE,
} = require('../utils/constants');

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

const SUPPORTED_LANGUAGES = ['en', 'pt', 'es', 'fr', 'de', 'it', 'ru', 'zh', 'ja', 'ar', 'hi'];

function normalizeLanguage(language = 'en') {
  const normalized = String(language).split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'en';
}

module.exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      marketingConsent = false,
      preferredLanguage = 'en',
    } = req.body;

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: passwordHash,
      marketingConsent,
      preferredLanguage: normalizeLanguage(preferredLanguage),
    });

    try {
      await sendNewRegistrationNotification(user);
    } catch (error) {
      console.error('Registration email notification failed:', error.message);
    }

    return res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      marketingConsent: user.marketingConsent,
      preferredLanguage: user.preferredLanguage,
    });
  } catch (err) {
    console.error('Registration error:', err);

    if (err.code === 11000) {
      return next(new ConflictError(DUPLICATE_EMAIL_MESSAGE));
    }

    return next(err);
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).trim().toLowerCase();

  User.findOne({ email: normalizedEmail }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError(INVALID_AUTH_MESSAGE);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError(INVALID_AUTH_MESSAGE);
        }

        const token = jwt.sign({ _id: user._id }, getJwtSecret(), { expiresIn: '7d' });
        res.send({ token });
      });
    })
    .catch(next);
};

module.exports.getProfile = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(USER_NOT_FOUND_MESSAGE);
      }

      res.send(user);
    })
    .catch(next);
};

module.exports.updatePreferredLanguage = (req, res, next) => {
  const { preferredLanguage } = req.body;
  const normalizedLanguage = normalizeLanguage(preferredLanguage);

  User.findByIdAndUpdate(
    req.user._id,
    { preferredLanguage: normalizedLanguage },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError(USER_NOT_FOUND_MESSAGE);
      }

      res.send(user);
    })
    .catch(next);
};
