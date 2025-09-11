// validateFields function to validate the fields required for creating or updating a blog
exports.validateBlogFields = (data) => {
    const { blog_title, blog_body, blog_intro } = data;

    if (!blog_title || !blog_body || !blog_intro) {
        throw new Error('Blog title, body, and intro are required.');
    };

    return true;
};

// validateBlogId function to validate the blog ID parameter
exports.validateBlogId = (id) => {
    if (!id || isNaN(id)) {
        throw new Error('Invalid or missing blog ID.');
    }

    return true;
};


// validateListBlogsParams function to validate the query parameters for listing blogs
exports.validateListBlogsParams = (query) => {
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