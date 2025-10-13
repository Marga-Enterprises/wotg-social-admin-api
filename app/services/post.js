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

// utility for sending notifications
const { sendNotification } = require('@utils/sendNotification');


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
// create a new post
exports.createPostService = async (data, userId) => {
  // 🧩 Validate input fields
  validatePostFields(data);

  const { content, mediaUrl, release_date, mediaType } = data;

  // 📝 Create the new post in the database
  const newPost = await Post.create({
    user_id: userId,
    content,
    release_date,
  });

  // 🎨 Save attached media (if any)
  if (mediaUrl) {
    await PostMedia.create({
      url: mediaUrl,
      type: mediaType || "image",
      post_id: newPost.id,
    });
  }

  // ♻️ Clear cache after new content
  await clearPostsCache();

  // -------------------------------------------------------------
  // 🔔 Send push notification only if release_date <= current date
  // -------------------------------------------------------------
  try {
    const now = new Date();
    const scheduledDate = release_date ? new Date(release_date) : now;

    // 🧠 Only send notification if release_date is now or in the past
    if (scheduledDate <= now) {
      const postUrl = `https://community.wotgonline.com/feeds?post=${newPost.id}`;

      await sendNotification(
        "📰 New Post Published!",
        content?.substring(0, 80) || "Check out the latest post on WOTG Community!",
        {
          url: postUrl,
          type: "post",
          postId: String(newPost.id),
        }
      );

      console.log(`✅ Notification sent for post ID ${newPost.id}`);
    } else {
      console.log(
        `🕓 Skipped notification for scheduled post ID ${newPost.id} (release_date: ${scheduledDate.toISOString()})`
      );
    }
  } catch (error) {
    console.error("⚠️ Failed to send push notification:", error.message);
  }

  // ✅ Return the created post
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
                attributes: ['id', 'user_profile_picture', 'user_fname', 'user_lname'],
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

    const { content, mediaUrl, mediaType, release_date } = data;

    const post = await Post.findByPk(postId);

    if (!post) {
        throw new Error('Post not found');
    }

    if (post.user_id !== userId) {
        throw new Error('Unauthorized: You can only update your own posts.');
    }

    // Update post content
    await post.update({
        content,
        release_date,
    });

    // Handle media updates if provided
    if (mediaUrl) {
        // Clear old media
        await PostMedia.destroy({ where: { post_id: postId } });

        // Insert new media
        await PostMedia.create({
            url: mediaUrl,
            type: mediaType || 'image',
            post_id: postId,
        });
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

    if (post.user_id !== userId) {
        throw new Error('Unauthorized: You can only delete your own posts.');
    }

    await post.destroy();

    await clearPostsCache(postId);

    return { message: 'Post deleted successfully.' };
};