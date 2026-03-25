const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./utils/logger');

dotenv.config();

const app = express();
const { PORT = 3001, MONGO_URI = 'mongodb://127.0.0.1:27017/agriclimate' } = process.env;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error.message));

app.use('/api', routes);

app.use(errorLogger);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
