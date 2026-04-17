const express = require("express");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.patch("/updatePassword", authMiddleware.protect, authController.updatePassword);

module.exports = router;
