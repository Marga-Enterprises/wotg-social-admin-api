const express = require("express");
const router = express.Router();

// controllers
const musicController = require('@controllers/music');

// Define routes for music operations
router.get('/', musicController.listMusic);
router.get('/:musicId', musicController.getMusicById);
router.post('/', musicController.createMusic);
router.put('/:musicId', musicController.updateMusic);
router.delete('/:musicId', musicController.deleteMusic);

// Export the router to be used in the main app
module.exports = router;