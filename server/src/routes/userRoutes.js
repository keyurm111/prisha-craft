const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/updateMe", authMiddleware.protect, userController.updateMe);
router.get("/", authMiddleware.protect, authMiddleware.restrictTo("admin"), userController.getAllUsers);

module.exports = router;
