const Coupon = require("../models/Coupon");

exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      status: "success",
      data: { coupon }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort("-createdAt");
    res.status(200).json({
      status: "success",
      results: coupons.length,
      data: { coupons }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!coupon) return res.status(404).json({ status: "fail", message: "Coupon not found" });
    res.status(200).json({
      status: "success",
      data: { coupon }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ status: "fail", message: "Coupon not found" });
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};

// Public route to validate coupon
exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ status: "fail", message: "Invalid coupon code" });
    }

    if (new Date() > coupon.expiryDate) {
      return res.status(400).json({ status: "fail", message: "Coupon has expired" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ status: "fail", message: "Coupon usage limit reached" });
    }

    if (amount < coupon.minPurchase) {
      return res.status(400).json({ 
        status: "fail", 
        message: `Minimum purchase of ₹${coupon.minPurchase} required for this coupon` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      status: "success",
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalAmount: Math.max(0, amount - discountAmount)
      }
    });
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
