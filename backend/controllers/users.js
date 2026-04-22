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

const { JWT_SECRET = 'dev-secret' } = process.env;

module.exports.register = (req, res, next) => {
  const {
    name,
    email,
    password,
    marketingConsent = false,
  } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
      marketingConsent,
    }))
    .then((user) => {
      sendNewRegistrationNotification(user).catch((error) => {
        console.error('Registration email notification failed:', error.message);
      });

      res.status(201).send({
        _id: user._id,
        name: user.name,
        email: user.email,
        marketingConsent: user.marketingConsent,
      });
    })
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError(DUPLICATE_EMAIL_MESSAGE));
      }

      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError(INVALID_AUTH_MESSAGE);
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError(INVALID_AUTH_MESSAGE);
        }

        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
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
