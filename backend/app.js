const dotenv = require('dotenv');

dotenv.config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const mongoose = require('mongoose');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./utils/logger');

const app = express();
const {
  PORT = 3001,
  MONGO_URI,
  JWT_SECRET,
  NODE_ENV = 'development',
  CLIENT_ORIGINS = '',
} = process.env;

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://agriclimate-phi.vercel.app',
  'https://agriclimate-4tl7kvly6-lbenaduces-projects.vercel.app',
];

const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...CLIENT_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean),
];

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

if (!JWT_SECRET || JWT_SECRET === 'dev-secret') {
  const message = 'JWT_SECRET is not defined or is using an unsafe default value';

  if (NODE_ENV === 'production') {
    console.error(message);
    process.exit(1);
  } else {
    console.warn(`${message}. Use only for local development.`);
  }
}

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

const weatherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many weather requests. Please try again later.' },
});

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use('/api/signup', authLimiter);
app.use('/api/signin', authLimiter);
app.use('/api/weather', weatherLimiter);
app.use('/api', apiLimiter, routes);

app.use(errorLogger);
app.use(errorHandler);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
