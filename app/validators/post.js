// validate post fields function to ensure post fields are correct
exports.validatePostFields = (data) => {
    const { content } = data;

    if (!content) {
        throw new Error('Post content is required.');
    }

    return true;
};


// validate postId function to ensure postId is a valid number
exports.validatePostId = (postId) => {
    if (!postId || isNaN(postId)) {
        throw new Error('Invalid postId: must be a number.');
    }

    return true;
};


// validate listPostsParams function to validate query parameters for listing posts
exports.validateListPostsParams = (query) => {
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
 