//utilities
const { 
    getToken, 
    sendSuccess,
    sendError
} = require('@utils/methods');

// services
const { loginService } = require('@services/auth');


// Login function
exports.login = async (req, res) => {
    // check if the user is already logged in
    const token = getToken(req.headers);
    if (token) return sendError(res, '', 'You are already logged in.');
    try {
        // call the service to login the user
        const result = await loginService(req.body);
        // if login is successful, send the token in the response
        return sendSuccess(res, result , 'Login successful.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};