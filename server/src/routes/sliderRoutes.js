const express = require("express");
const sliderController = require("../controllers/sliderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public route to get active sliders
router.get("/", sliderController.getAllSliders);

// Admin routes
router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.post("/", sliderController.createSlider);
router.patch("/:id", sliderController.updateSlider);
router.delete("/:id", sliderController.deleteSlider);

module.exports = router;
