const express = require('express');
const uploadController = require('../controllers/uploadController');
const router = express.Router();

// Publicly available for now, add auth if needed
router.post('/image', uploadController.uploadImage);

module.exports = router;
