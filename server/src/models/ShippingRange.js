const mongoose = require("mongoose");

const shippingRangeSchema = new mongoose.Schema({
  minWeight: {
    type: Number, // in grams
    required: [true, "Please provide a minimum weight in grams"],
    min: [0, "Minimum weight cannot be negative"]
  },
  maxWeight: {
    type: Number, // in grams
    required: [true, "Please provide a maximum weight in grams"],
    min: [0, "Maximum weight cannot be negative"]
  },
  cost: {
    type: Number,
    required: [true, "Please provide a shipping cost"],
    min: [0, "Shipping cost cannot be negative"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ShippingRange = mongoose.model("ShippingRange", shippingRangeSchema);
module.exports = ShippingRange;
