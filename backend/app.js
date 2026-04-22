const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger, errorLogger } = require('./utils/logger');

dotenv.config();

const app = express();
const { PORT = 3001, MONGO_URI } = process.env;

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined');
  process.exit(1);
}

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

app.use('/api', routes);

app.use(errorLogger);
app.use(errorHandler);