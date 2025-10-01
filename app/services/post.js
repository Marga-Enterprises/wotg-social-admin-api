// model imports
const { Post, User } = require('@models');

// validators
const {
    validatePostFields,
    validatePostId,
    validateListPostsParams,
} = require('@validators/post');

// redis client
const redisClient = require('@config/redis');

// utility redis client
const {
    clearPostsCache
} = require('@utils/clearRedisCache');


// services functions

// list all posts with pagination
exports.listPostsService = async (query) => {
    validateListPostsParams(query);

    let { pageIndex, pageSize } = query;

    pageIndex = parseInt(pageIndex);
    pageSize = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const cacheKey = `posts:page:${pageIndex}:size:${pageSize}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    };

    const whereClause = {
        userId: 244
    };

    const { count, rows } = await Post.findAndCountAll({
        offset,
        where: whereClause,
        limit,
        order: [['created_at', 'DESC']],
        include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar_url'],
        }],
    });


    const totalPages = Math.ceil(count / pageSize);

    const result = {
        totalItems: count,
        totalPages,
        currentPage: pageIndex,
        posts: rows,
    };

    return result;
};


// create a new post
exports.createPostService = async (data, userId) => {
    validatePostFields(data);

    const { content } = data;

    const newPost = await Post.create({
        userId,
        content,
    });

    await clearPostsCache();

    return newPost;
};


// get post by id
exports.getPostByIdService = async (postId) => {
    validatePostId(postId);

    const cacheKey = `post_${postId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const post = await Post.findByPk(postId, {
        include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'avatar_url'],
        }],
    });

    if (!post) {
        throw new Error('Post not found');
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(post)); // Cache for 1 hour

    return post;
};

// update a post
exports.updatePostService = async (postId, data, userId) => {
    validatePostId(postId);
    validatePostFields(data);

    const post = await Post.findByPk(postId);

    if (!post) {
        throw new Error('Post not found');
    }

    if (post.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own posts.');
    }

    await post.update({
        content: data.content,
    });

    await clearPostsCache(postId);

    return post;
};

// delete a post
exports.deletePostService = async (postId, userId) => {
    validatePostId(postId);

    const post = await Post.findByPk(postId);
    
    if (!post) {
        throw new Error('Post not found');
    }

    if (post.userId !== userId) {
        throw new Error('Unauthorized: You can only delete your own posts.');
    }

    await post.destroy();

    await clearPostsCache(postId);

    return { message: 'Post deleted successfully.' };
};