// utilities
const { 
    getToken, 
    sendSuccess,
    sendError,
    sendUnauthorizedError,
} = require('@utils/methods');

// services
const {
    listUsersService,
    getUserByIdService,
    updateUserDGroupStatusService,
} = require('@services/user');


// List users function
exports.listUsers = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const result = await listUsersService(req.query);
        return sendSuccess(res, result , 'Users fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    };
};


// Get user by ID function
exports.getUserById = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { userId } = req.params;
        const result = await getUserByIdService(userId);
        return sendSuccess(res, result , 'User fetched successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};


// Update user's D-Group membership status function
exports.updateUserDGroupStatus = async (req, res) => {
    const token = getToken(req.headers);
    if (!token) return sendUnauthorizedError(res, 'You must be logged in to access this resource.');

    try {
        const { userId } = req.params;
        const { isDGroupMember } = req.body;
        const result = await updateUserDGroupStatusService(userId, isDGroupMember);
        return sendSuccess(res, result , 'User D-Group membership status updated successfully.');
    } catch (error) {
        return sendError(res, '', error.message, error.status);
    }
};