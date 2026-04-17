const Config = require("../models/Config");
const nodemailer = require("nodemailer");

exports.getSettings = async (req, res) => {
  try {
    let settings = await Config.findOne({ key: "email_settings" });
    
    if (!settings) {
      return res.status(200).json({
        status: "success",
        data: {
          settings: {
            adminEmail: "",
            emailPassword: "",
            smtpHost: "smtp.gmail.com",
            smtpPort: 465
          }
        }
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        settings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { adminEmail, emailPassword, smtpHost, smtpPort } = req.body;

    let settings = await Config.findOneAndUpdate(
      { key: "email_settings" },
      { 
        adminEmail, 
        emailPassword, 
        smtpHost: smtpHost || "smtp.gmail.com", 
        smtpPort: smtpPort || 465,
        updatedAt: Date.now()
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        settings
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.testEmail = async (req, res) => {
  try {
    const { adminEmail, emailPassword, smtpHost, smtpPort } = req.body;

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost || "smtp.gmail.com",
      port: smtpPort || 465,
      secure: (smtpPort || 465) === 465, // true for 465, false for other ports
      auth: {
        user: adminEmail,
        pass: emailPassword,
      },
    });

    // Send test email
    await transporter.sendMail({
      from: `"Meili Admin" <${adminEmail}>`,
      to: adminEmail,
      subject: "🔒 Meili SMTP Bridge Test",
      text: "Connection Successful. You will now receive administrative alerts for new orders and inquiries.",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #000; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 20px;">Meili Dashboard</h2>
          <p style="color: #666; line-height: 1.6;">Your SMTP connection was established successfully.</p>
          <div style="background: #fcfcfc; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #eee;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #000;">Protocol: <span style="font-weight: normal; color: #666;">Verified</span></p>
            <p style="margin: 10px 0 0; font-size: 14px; font-weight: bold; color: #000;">Status: <span style="font-weight: normal; color: #666;">Administrative Alerts Enabled</span></p>
          </div>
          <p style="font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">Engineering Excellence • Curating Luxury</p>
        </div>
      `,
    });

    res.status(200).json({
      status: "success",
      message: "Test email sent successfully"
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: `Mail error: ${err.message}`
    });
  }
};
