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
    getPresignedUrlService
} = require('@services/media');


// Get presigned URL function
exports.getPresignedUrl = async (req, res) => {
    // check if the user is logged in
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { fileName, fileType } = req.body;

        // call the service to get the presigned URL
        const result = await getPresignedUrlService({ fileName, fileType });

        // if successful, send the result in the response
        return sendSuccess(res, result , 'Presigned URL generated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};