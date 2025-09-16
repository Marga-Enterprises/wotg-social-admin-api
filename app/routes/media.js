const express = require('express');
const router = express.Router();

// Import the media controller
const mediaController = require('@controllers/media');

// Define route for getting presigned URL
router.post('/presigned-url', mediaController.getPresignedUrl);

// Export the router to be used in the main app
module.exports = router;