const express = require("express");
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public route to validate coupon
router.post("/validate", couponController.validateCoupon);

// Protected Admin Routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router
  .route("/")
  .get(couponController.getAllCoupons)
  .post(couponController.createCoupon);

router
  .route("/:id")
  .patch(couponController.updateCoupon)
  .delete(couponController.deleteCoupon);

module.exports = router;
