const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Customer name is required"]
  },
  role: {
    type: String,
    default: "Verified Buyer"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  content: {
    type: String,
    required: [true, "Testimonial content is required"]
  },
  avatar: {
    type: String,
    default: ""
  },
  featured: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Testimonial", testimonialSchema);
