const nodemailer = require('nodemailer');

// Cache the transporter so we don't recreate it (and, in dev, fetch a new
// Ethereal test account over the network) on every single email.
let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  if (!process.env.SMTP_HOST) {
    // No SMTP configured → throwaway Ethereal account for local dev.
    // Real email is NOT delivered; a preview URL is logged instead.
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  } else {
    const port = parseInt(process.env.SMTP_PORT, 10) || 587;
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // Port 465 expects TLS immediately; 587 upgrades via STARTTLS.
      // This must be correct or providers like Namecheap Private Email fail.
      secure: port === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return cachedTransporter;
};

const sendEmail = async (options) => {
  const transporter = await getTransporter();

  const message = {
    from: `${process.env.FROM_NAME || 'NovaStore'} <${process.env.FROM_EMAIL || 'noreply@novastore.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  if (!process.env.SMTP_HOST) {
    console.log(`✉️ Email sent! Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  }
};

module.exports = sendEmail;
