const express = require('express');
const router = express.Router();

// Import the blog controller
const blogController = require('@controllers/blog');

// Define routes for blog operations
router.get('/', blogController.listBlogs);
router.get('/:blogId', blogController.getBlogById);
router.post('/', blogController.createBlog);
router.put('/:blogId', blogController.updateBlog);
router.delete('/:blogId', blogController.deleteBlog);

// Export the router to be used in the main app
module.exports = router;