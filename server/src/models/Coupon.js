const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Please provide a coupon code"],
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ["percentage", "fixed"],
    default: "percentage"
  },
  discountValue: {
    type: Number,
    required: [true, "Please provide a discount value"]
  },
  minPurchase: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: [true, "Please provide an expiry date"]
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
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

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
