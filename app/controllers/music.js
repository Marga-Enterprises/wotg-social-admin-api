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
    listMusicService,
    getMusicByIdService,
    createMusicService,
    updateMusicService,
    deleteMusicService
} = require('@services/music');


// List music function
exports.listMusic = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        // call the service to get the list of music
        const result = await listMusicService(req.query);
        // if successful, send the result in the response
        return sendSuccess(res, result, 'Music fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Get music by ID function
exports.getMusicById = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { musicId } = req.params;
        // call the services to get the music id 
        const result = await getMusicByIdService(musicId);

        // if successful, send the result in the response
        return sendSuccess(res, result, 'Music fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Create music function
exports.createMusic = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        // call the service to create a new music entry
        const result = await createMusicService(req.body);
        // if successful, send the result in the response
        return sendSuccess(res, result, 'Music created successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Update music function
exports.updateMusic = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { musicId } = req.params;

        // call the service to update the music entry
        const result = await updateMusicService(musicId, req.body);

        // if successful, send the result in the response
        return sendSuccess(res, result, 'Music updated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Delete music function
exports.deleteMusic = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');
    
    try {
        const { musicId } = req.params;
        // call the service to delete the music entry
        const result = await deleteMusicService(musicId);
        // if successful, send the result in the response
        return sendSuccess(res, result, 'Music deleted successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};