const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: "email_settings"
  },
  adminEmail: {
    type: String,
    required: [true, "Admin email is required"],
    trim: true,
    lowercase: true
  },
  emailPassword: {
    type: String,
    required: [true, "Email app password is required"]
  },
  smtpHost: {
    type: String,
    default: "smtp.gmail.com"
  },
  smtpPort: {
    type: Number,
    default: 465
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Config = mongoose.model("Config", configSchema);

module.exports = Config;
