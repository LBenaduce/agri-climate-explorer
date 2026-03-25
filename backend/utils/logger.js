const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const requestLogPath = path.join(logsDir, 'request.log');
const errorLogPath = path.join(logsDir, 'error.log');

function ensureLogDirectory() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

function writeLog(filePath, message) {
  ensureLogDirectory();
  fs.appendFile(filePath, `${message}\n`, (error) => {
    if (error) {
      console.error('Unable to write log:', error.message);
    }
  });
}

function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    writeLog(
      requestLogPath,
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });

  next();
}

function errorLogger(err, req, res, next) {
  writeLog(
    errorLogPath,
    `${new Date().toISOString()} ${req.method} ${req.originalUrl} ${err.statusCode || 500} ${err.message}`
  );
  next(err);
}

module.exports = {
  requestLogger,
  errorLogger,
};
