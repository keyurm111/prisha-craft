const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", authMiddleware.protect, authMiddleware.restrictTo("admin"), categoryController.createCategory);
router.patch("/update-rankings", authMiddleware.protect, authMiddleware.restrictTo("admin"), categoryController.updateRankings);
router.patch("/:id", authMiddleware.protect, authMiddleware.restrictTo("admin"), categoryController.updateCategory);
router.delete("/:id", authMiddleware.protect, authMiddleware.restrictTo("admin"), categoryController.deleteCategory);

module.exports = router;
