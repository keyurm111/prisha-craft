const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: {
    type: String,
    required: [true, "Slider image is required"]
  },
  ctaText: String,
  ctaLink: {
    type: String,
    default: "/"
  },
  order: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
});

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Your name is required"]
  },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  whatsapp: String,
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product"
  },
  message: {
    type: String,
    required: [true, "Please provide a message"]
  },
  status: {
    type: String,
    enum: ["pending", "handled", "ignored"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const HeroSlider = mongoose.model("HeroSlider", heroSliderSchema);
const Inquiry = mongoose.model("Inquiry", inquirySchema);

module.exports = { HeroSlider, Inquiry };
