// utilities
const { 
    getToken, 
    sendSuccess,
    sendError,
    decodeToken,
    sendUnauthorizedError,
} = require('@utils/methods');

// services
const {
    listPostsService,
    getPostByIdService,
    createPostService,
    updatePostService,
    deletePostService
} = require('@services/post');


// List posts function
exports.listFeedPosts = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const result = await listPostsService(req.query);
        return sendSuccess(res, result , 'Posts fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    };
};


// Get post by ID function
exports.getPostById = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { postId } = req.params;
        const result = await getPostByIdService(postId);
        return sendSuccess(res, result , 'Post fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Create post function
exports.createPost = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const decoded = decodeToken(token);
        const userId = decoded.id;

        const result = await createPostService(req.body, userId);
        return sendSuccess(res, result , 'Post created successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Update post function
exports.updatePost = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const decoded = decodeToken(token);
        const userId = decoded.id;
        const { postId } = req.params;

        const result = await updatePostService(postId, req.body, userId);
        return sendSuccess(res, result , 'Post updated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Delete post function
exports.deletePost = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const decoded = decodeToken(token);
        const userId = decoded.id;
        const { postId } = req.params;

        const result = await deletePostService(postId, userId);
        return sendSuccess(res, result , 'Post deleted successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};