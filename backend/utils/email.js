const nodemailer = require('nodemailer');

function createTransporter() {
  console.log("Creating transporter...");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ EMAIL ENV VARIABLES MISSING");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "SET" : "NOT SET");
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
  console.log("📧 Sending registration email...");

  const transporter = createTransporter();

  if (!transporter) {
    console.log("❌ No transporter, email not sent");
    return;
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    const info = await transporter.sendMail({
      from: `"AgriClimate Pro" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: '🌱 New User Registered',
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

    console.log("✅ Email sent:", info.response);

  } catch (err) {
    console.error("❌ EMAIL ERROR FULL:", err);
  }
}

module.exports = {
  sendNewRegistrationNotification,
};