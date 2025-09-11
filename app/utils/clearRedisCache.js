// redis client
const redisClient = require('@config/redis');


// clear department cache
exports.clearBlogCache = async (blogId) => {
  try {
    console.log("🧹 Clearing blog cache...");

    // Define the key patterns for blogs
    const paginatedPattern = `blogs_page_*`;

    // If a blogId is provided, create a specific key for that blog
    const blogKeys = blogId ? [`blog_${blogId}`] : [];

    // Fetch all keys matching the paginated pattern
    const allPaginatedKeys = await redisClient.keys(paginatedPattern);

    // Combine all keys into a unique set
    const allKeys = [...new Set([...allPaginatedKeys, ...blogKeys])];

    // If there are any keys to delete, proceed with deletion
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️ Cleared ${allKeys.length} blog cache entries.`);
    } else {
      console.log("ℹ️ No matching blog cache keys found.");
    }

    console.log("✅ Blog cache cleared.");
  } catch (error) {
    console.error("❌ Error clearing blog cache:", error);
  }
};


