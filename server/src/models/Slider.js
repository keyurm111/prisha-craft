const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Slider title is required"]
  },
  subtitle: {
    type: String,
    required: [true, "Slider subtitle is required"]
  },
  image: {
    type: String,
    required: [true, "Desktop slider image is required"]
  },
  mobileImage: {
    type: String,
    required: false
  },
  ctaText: {
    type: String,
    default: "Shop Now"
  },
  ctaLink: {
    type: String,
    default: "/shop"
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Slider", sliderSchema);
