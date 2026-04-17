const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.post("/", authMiddleware.protect, categoryController.createCategory);
router.patch("/update-rankings", authMiddleware.protect, categoryController.updateRankings);
router.patch("/:id", authMiddleware.protect, categoryController.updateCategory);
router.delete("/:id", authMiddleware.protect, categoryController.deleteCategory);

module.exports = router;
