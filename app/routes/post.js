const express = require('express');
const router = express.Router();

// controllers
const postController = require('@controllers/post');

// routes
router.get('/', postController.listFeedPosts);
router.get('/:postId', postController.getPostById);
router.post('/', postController.createPost);
router.put('/:postId', postController.updatePost);
router.delete('/:postId', postController.deletePost);

// export the router
module.exports = router;