const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.patch("/updateMe", authMiddleware.protect, userController.updateMe);
router.get("/", userController.getAllUsers);

module.exports = router;
