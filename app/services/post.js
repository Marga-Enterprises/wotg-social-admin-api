// model imports
const { Post, User, PostMedia } = require('@models');

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

    const cacheKey = `posts:page:${pageIndex}:size:${pageSize}:user:244`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    };

    const whereClause = {
        user_id: 244
    };

    const { count, rows } = await Post.findAndCountAll({
        offset,
        where: whereClause,
        limit,
        order: [['created_at', 'DESC']],
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'user_profile_picture', 'user_fname', 'user_lname'],
            },
            {
                model: PostMedia,
                as: 'media',
                attributes: ['id', 'type', 'url', 'thumbnail'],
            }
        ],
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

    const { content, mediaUrls, mediaType } = data;

    const newPost = await Post.create({
        userId,
        content,
    });

    // If mediaUrls is provided (either a string or array)
    if (mediaUrls) {
        const urls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];

        // Use Promise.all to create all medias in parallel
        await Promise.all(
            urls.map(url =>
                PostMedia.create({
                    url,
                    type: mediaType || 'image',
                    postId: newPost.id,
                })
            )
        );
    }

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
        include: [
            {
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'avatar_url'],
            },
            {
                model: PostMedia,
                as: 'media',
                attributes: ['id', 'type', 'url', 'thumbnail'],
            }
        ],
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

    const { content, mediaUrls, mediaType } = data;

    const post = await Post.findByPk(postId, {
        include: [PostMedia],
    });

    if (!post) {
        throw new Error('Post not found');
    }

    if (post.userId !== userId) {
        throw new Error('Unauthorized: You can only update your own posts.');
    }

    // Update post content
    await post.update({
        content,
    });

    // Handle media updates if provided
    if (mediaUrls) {
        const urls = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];

        // First clear old media (if any)
        await PostMedia.destroy({ where: { postId } });

        // Then insert the new set of media
        await Promise.all(
            urls.map(url =>
                PostMedia.create({
                    url,
                    type: mediaType || 'image',
                    postId,
                })
            )
        );
    }

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