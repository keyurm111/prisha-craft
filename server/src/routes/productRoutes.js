const express = require("express");
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProduct);
// Protected routes for admin (role check can be added later)
router.post("/", authMiddleware.protect, productController.createProduct);
router.patch("/update-rankings", authMiddleware.protect, productController.updateRankings);
router.patch("/:id", authMiddleware.protect, productController.updateProduct);
router.delete("/:id", authMiddleware.protect, productController.deleteProduct);

module.exports = router;
