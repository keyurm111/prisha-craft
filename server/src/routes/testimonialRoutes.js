const express = require("express");
const testimonialController = require("../controllers/testimonialController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", testimonialController.getAllTestimonials);
router.get("/:id", testimonialController.getTestimonial);

// Admin-only routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.post("/", testimonialController.createTestimonial);
router.patch("/:id", testimonialController.updateTestimonial);
router.delete("/:id", testimonialController.deleteTestimonial);

module.exports = router;
