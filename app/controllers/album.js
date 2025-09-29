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
    listAlbumsService,
    getAlbumByIdService,
    createAlbumService,
    updateAlbumService,
    deleteAlbumService
} = require('@services/album');


// List albums function
exports.listAlbums = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        // call the service to get the list of albums
        const result = await listAlbumsService(req.query);
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Albums fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Get album by ID function
exports.getAlbumById = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { albumId } = req.params;
        // call the service to get the album by ID
        const result = await getAlbumByIdService(albumId);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Album fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Create album function
exports.createAlbum = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const user = decodeToken(token);
        const albumData = req.body;

        // call the service to create a new album
        const result = await createAlbumService(albumData, user);

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Album created successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Update album function
exports.updateAlbum = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { albumId } = req.params;
        const albumData = req.body;

        // call the service to update the album
        const result = await updateAlbumService(albumId, albumData);
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Album updated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Delete album function
exports.deleteAlbum = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { albumId } = req.params;
        // call the service to delete the album
        const result = await deleteAlbumService(albumId);
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Album deleted successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};