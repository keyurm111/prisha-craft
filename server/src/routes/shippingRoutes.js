const express = require("express");
const shippingController = require("../controllers/shippingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All shipping routes require login
router.use(authMiddleware.protect);

// Client-facing endpoint: Calculate shipping rates
router.post("/calculate-rates", shippingController.calculateRates);

// Admin-only endpoints: Shiprocket logistics
router.use(authMiddleware.restrictTo("admin"));

router.post("/push-order", shippingController.pushOrderToShiprocket);
router.post("/assign-awb", shippingController.assignAwb);
router.post("/generate-label", shippingController.generateLabel);
router.post("/schedule-pickup", shippingController.schedulePickup);

module.exports = router;
