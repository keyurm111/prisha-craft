const express = require("express");
const blogController = require("../controllers/blogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlog);

// Protected routes (Admin only)
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin"));

router.post("/", blogController.createBlog);
router.patch("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);

module.exports = router;
