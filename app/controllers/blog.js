//utilities
const { 
    getToken, 
    sendSuccess,
    sendError,
    decodeToken,
    sendUnauthorizedError,
} = require('@utils/methods');

// services
const { 
    listBlogsService, 
    getBlogByIdService,
    createBlogService,
    updateBlogService,
    deleteBlogService
} = require('@services/blog');


// List blogs function
exports.listBlogs = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        // call the service to get the list of blogs
        const result = await listBlogsService(req.query);
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Blogs fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Get blog by ID function
exports.getBlogById = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { blogId } = req.params;
        // call the service to get the blog by ID
        const result = await getBlogByIdService(blogId);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Blog fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Create blog function
exports.createBlog = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    // decode the token to get user info
    const decoded = decodeToken(token);
    if (!decoded) return sendUnauthorizedError(res, 'Invalid token. Please log in again.');

    try {
        // call the service to create the blog
        const result = await createBlogService(req.body, decoded.id);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Blog created successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Update blog function
exports.updateBlog = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');
    try {
        const { blogId } = req.params;

        // call the service to update the blog
        const result = await updateBlogService(blogId, req.body);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Blog updated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Delete blog function
exports.deleteBlog = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { blogId } = req.params;

        // call the service to delete the blog
        const result = await deleteBlogService(blogId);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Blog deleted successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};