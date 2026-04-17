const express = require("express");
const configController = require("../controllers/configController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Only Admins can manage system settings
router.use(authMiddleware.protect);
router.use(authMiddleware.restrictTo("admin", "Admin"));

router.get("/", configController.getSettings);
router.patch("/", configController.updateSettings);
router.post("/test-email", configController.testEmail);

module.exports = router;
