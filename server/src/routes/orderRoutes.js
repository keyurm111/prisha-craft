const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware.protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);
router.post("/:id/cancel", orderController.cancelOrder);

// Admin only routes
router.use(authMiddleware.restrictTo("admin"));
router.get("/", orderController.getAllOrders);
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);
router.post("/:id/retry-refund", orderController.retryRefund);

module.exports = router;
