const nodemailer = require('nodemailer');

const {
  EMAIL_HOST = 'smtp.gmail.com',
  EMAIL_PORT = '587',
  EMAIL_USER = '',
  EMAIL_PASS = '',
  ADMIN_NOTIFY_EMAIL = 'cabrasraceteam@gmail.com',
} = process.env;

const isEmailConfigured = Boolean(EMAIL_USER && EMAIL_PASS && ADMIN_NOTIFY_EMAIL);

let transporter = null;

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

function sendNewRegistrationNotification(user) {
  if (!transporter) {
    return Promise.resolve({ skipped: true, reason: 'Email is not configured' });
  }

  const consentText = user.marketingConsent ? 'Yes' : 'No';

  return transporter.sendMail({
    from: `"AgriClimate Pro" <${EMAIL_USER}>`,
    to: ADMIN_NOTIFY_EMAIL,
    subject: 'New user registration on AgriClimate Pro',
    text: [
      'A new user just registered on the website.',
      '',
      `Name: ${user.name}`,
      `Email: ${user.email}`,
      `Marketing consent: ${consentText}`,
      `Registered at: ${new Date().toISOString()}`,
    ].join('\n'),
  });
}

module.exports = {
  sendNewRegistrationNotification,
};
