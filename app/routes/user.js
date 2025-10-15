const express = require('express');

const router = express.Router();

// controllers
const userController = require('@controllers/user');

// routes
router.get('/', userController.listUsers);
router.get('/:userId', userController.getUserById);

// export the router
module.exports = router;