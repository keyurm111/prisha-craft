const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
    default: "image/webp",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Upload", uploadSchema);
