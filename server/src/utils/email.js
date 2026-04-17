const nodemailer = require("nodemailer");
const Config = require("../models/Config");

const sendEmail = async (options) => {
  // 1) Get email settings from DB
  const settings = await Config.findOne({ key: "email_settings" });

  if (!settings || !settings.adminEmail || !settings.emailPassword) {
    console.warn("⚠️ Email settings not configured. Mail skipped.");
    return;
  }

  // 2) Create a transporter
  const transporter = nodemailer.createTransport({
    host: settings.smtpHost || "smtp.gmail.com",
    port: settings.smtpPort || 465,
    secure: (settings.smtpPort || 465) === 465,
    auth: {
      user: settings.adminEmail,
      pass: settings.emailPassword,
    },
  });

  // 3) Define the email options
  const mailOptions = {
    from: `"Prisha Crafts" <${settings.adminEmail}>`,
    to: options.to || settings.adminEmail,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // 4) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
