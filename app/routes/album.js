const express = require('express');
const router = express.Router();

// Import the album controller
const albumController = require('@controllers/album');

// Define routes for album operations
router.get('/', albumController.listAlbums);
router.get('/:albumId', albumController.getAlbumById);
router.post('/', albumController.createAlbum);
router.put('/:albumId', albumController.updateAlbum);
router.delete('/:albumId', albumController.deleteAlbum);

// Export the router to be used in the main app
module.exports = router;