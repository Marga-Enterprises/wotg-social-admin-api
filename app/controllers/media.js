//utilities
const { 
    getToken, 
    sendSuccess,
    sendError,
    sendUnauthorizedError,
} = require('@utils/methods');

// services
const { 
    getPresignedUrlForImagesService,
    getPresignedUrlForAudiosService,
    getPresignedUrlForVideosService
} = require('@services/media');


// Get presigned URL function for images
exports.getPresignedUrlForImages = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { fileName, fileType } = req.body;

        // call the service to get the presigned URL
        const result = await getPresignedUrlForImagesService({ fileName, fileType });

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Presigned URL generated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Get presigned URL function for audios
exports.getPresignedUrlForAudios = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { fileName, fileType } = req.body;
        // call the service to get the presigned URL
        const result = await getPresignedUrlForAudiosService({ fileName, fileType });
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Presigned URL generated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Get presigned URL function for videos
exports.getPresignedUrlForVideos = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { fileName, fileType } = req.body;
        // call the service to get the presigned URL
        const result = await getPresignedUrlForVideosService({ fileName, fileType });
        // if successful, send the result in the response
        return sendSuccess(res, result , 'Presigned URL generated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};