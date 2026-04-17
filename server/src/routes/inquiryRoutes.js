const express = require("express");
const inquiryController = require("../controllers/inquiryController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", inquiryController.createInquiry);
router.get("/", authMiddleware.protect, authMiddleware.restrictTo("admin"), inquiryController.getAllInquiries);

module.exports = router;
