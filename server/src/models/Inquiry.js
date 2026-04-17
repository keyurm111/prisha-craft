const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    lowercase: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, "Please provide a subject line"]
  },
  message: {
    type: String,
    required: [true, "Please provide your message"]
  },
  status: {
    type: String,
    enum: ["pending", "read", "resolved"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = Inquiry;
