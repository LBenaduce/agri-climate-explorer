const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials missing');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendNewRegistrationNotification(user) {
  const transporter = createTransporter();

  if (!transporter) return;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  await transporter.sendMail({
    from: `"AgriClimate Pro" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: '🌱 New User Registered - AgriClimate Pro',
    text: `
New user registered:

Name: ${user.name || 'Not provided'}
Email: ${user.email}
Language: ${user.preferredLanguage || 'Not provided'}
Marketing: ${user.marketingConsent ? 'Yes' : 'No'}

User ID: ${user._id}
Date: ${new Date().toISOString()}
    `,
  });
}

module.exports = {
  sendNewRegistrationNotification,
};