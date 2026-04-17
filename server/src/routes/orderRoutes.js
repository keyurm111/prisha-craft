const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// All order routes require authentication
router.use(authMiddleware.protect);

router.post("/", orderController.createOrder);
router.get("/my-orders", orderController.getMyOrders);

// Admin only routes
router.get("/", orderController.getAllOrders);
router.patch("/:id/status", orderController.updateOrderStatus);
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
