// models imports
const { Blog } = require('@models');

// validators
const { 
    validateBlogFields,
    validateBlogId,
    validateListBlogsParams,
} = require('@validators/blog');

// redis client
const redisClient = require('@config/redis');

// utility redis client
const { 
    clearBlogCache,
} = require('@utils/clearRedisCache');

// utility for sending notifications
const { sendNotification } = require('@utils/sendNotification');

// services functions

// list of blogs with pagination and optional search
exports.listBlogsService = async (query) => {
    validateListBlogsParams(query);

    let { pageIndex, pageSize, search } = query;

    pageIndex = parseInt(pageIndex);
    pageSize = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize; // ✅ FIXED HERE
    const limit = pageSize;

    const cacheKey = `blogs_page_${pageIndex}_size_${pageSize}_role_admin`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const whereClause = search ? {
        blog_title: {
            [Op.iLike]: `%${search}%`
        }
    } : {};

    const { count, rows } = await Blog.findAndCountAll({
        where: whereClause,
        offset,
        limit,
        order: [['created_at', 'DESC']],
    });

    const totalPages = Math.ceil(count / pageSize);

    const result = {
        totalItems: count,
        totalPages,
        currentPage: pageIndex,
        blogs: rows,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(result));

    return result;
};


// get a single blog by ID
exports.getBlogByIdService = async (blogId) => {
    // Validate the blog ID
    validateBlogId(blogId);

    // create new cache key
    const cacheKey = `blog_${blogId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    // find the blog by ID
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
        const error = new Error('Blog not found.');
        error.status = 404;
        throw error;
    }

    // cache the result for future requests
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(blog)); // Cache for 1 hour

    return blog;
};


// create a new blog
exports.createBlogService = async (data, id) => {
    // Validate blog fields
    validateBlogFields(data);

    // Create a JS Date object representing today's date at 12:00 AM
    const phMidnight = new Date();
    phMidnight.setHours(0, 0, 0, 0); // Set to 12:00:00 AM of today (in server's local time)

    // Create the blog without converting to UTC
    const newBlog = await Blog.create({
        ...data,
        blog_creator: id,
        blog_release_date_and_time: phMidnight,
        blog_approved: false,
    });

    // Clear relevant cache
    await clearBlogCache();

    return newBlog;
};



// update an existing blog
// -------------------------------------------------------------
// 📰 Update an existing blog & notify subscribers (owner only)
// -------------------------------------------------------------
exports.updateBlogService = async (blogId, data, userRole) => {
  // 🧩 Validate blog ID and input fields
  validateBlogId(blogId);
  validateBlogFields(data, true); // true = update mode

  // 🔍 Find the existing blog record
  const blog = await Blog.findByPk(blogId);
  if (!blog) {
    const error = new Error("Blog not found.");
    error.status = 404;
    throw error;
  }

  // -------------------------------------------------------------
  // 👑 If user is owner → approve + update + possibly notify
  // -------------------------------------------------------------
  if (userRole === "owner") {
    await blog.update({
      blog_approved: true,
      ...data,
    });

    // ♻️ Clear cache for this blog
    await clearBlogCache(blogId);

    // -------------------------------------------------------------
    // 🔔 Send notification only if blog is released (by owner)
    // -------------------------------------------------------------
    try {
      const now = new Date();
      const releaseDate = data.blog_release_date_and_time
        ? new Date(data.blog_release_date_and_time)
        : now;

      if (releaseDate <= now) {
        const blogUrl = `https://community.wotgonline.com/blogs/${blogId}`;

        await sendNotification(
          "📰 New Blog Released!",
          blog.blog_title?.substring(0, 80) ||
            "A new blog is now available on WOTG Community!",
          {
            url: blogUrl,
            type: "blog",
            blogId: String(blogId),
          }
        );

        console.log(`✅ Notification sent for blog ID ${blogId}`);
      } else {
        console.log(
          `🕓 Skipped notification for scheduled blog ID ${blogId} (release_date: ${releaseDate.toISOString()})`
        );
      }
    } catch (error) {
      console.error("⚠️ Failed to send blog release notification:", error.message);
    }

    return blog;
  }

  // -------------------------------------------------------------
  // 👤 For non-owner users → just update (no notification)
  // -------------------------------------------------------------
  await blog.update(data);
  await clearBlogCache(blogId);
  console.log(`✏️ Blog ID ${blogId} updated by non-owner (no notification sent)`);

  return blog;
};


// delete a blog by ID
exports.deleteBlogService = async (blogId) => {
    // Validate the blog ID
    validateBlogId(blogId);

    // Find the blog by ID
    const blog = await Blog.findByPk(blogId);

    if (!blog) {
        const error = new Error('Blog not found.');
        error.status = 404;
        throw error;
    }

    // Delete the blog
    await blog.destroy();

    // Clear relevant cache
    await clearBlogCache();

    return { message: 'Blog deleted successfully.' };
};