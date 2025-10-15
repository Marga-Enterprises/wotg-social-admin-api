// validate user id function to ensure userId is a valid number
exports.validateUserId = (userId) => {
    if (!userId || isNaN(userId)) {
        throw new Error('Invalid userId: must be a number.');
    }

    return true;
};


// validate params for list users
exports.validateListUsersParams = (query) => {
    const { pageIndex, pageSize } = query;

    if (
        !pageIndex ||
        !pageSize ||
        isNaN(pageIndex) ||
        isNaN(pageSize) ||
        pageIndex < 0 ||
        pageSize <= 0
    ) {
        throw new Error('Invalid pagination parameters.');
    }
    
    return true;
};