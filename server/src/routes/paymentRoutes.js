const express = require("express");
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Webhook endpoint must be public (Razorpay calls it without Bearer token)
router.post("/webhook", paymentController.handleWebhook);

// Payment signature verification requires customer authentication
router.post("/verify", authMiddleware.protect, paymentController.verifyPayment);

module.exports = router;
