// redis client
const redisClient = require('@config/redis');


// clear blog cache
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


// clear album cache
exports.clearAlbumCache = async (albumId) => {
  try {
    console.log("🧹 Clearing album cache...");

    // Define the key patterns for albums
    const paginatedPattern = "albums:page:*";
    // const filteredPattern = "albums:page:*:user:*:viewer:*";

    // If an albumId is provided, fetch specific keys for that album
    const albumKeys = albumId ? await redisClient.keys(`album*_${albumId}`) : [];

    // Fetch all keys matching the paginated pattern
    const allPaginatedKeys = await redisClient.keys(paginatedPattern);
    // const allFilteredKeys = await redisClient.keys(filteredPattern);

    // Combine all keys into a unique set
    const allKeys = [...new Set([...allPaginatedKeys, /* ...allFilteredKeys, */ ...albumKeys])];

    // If there are any keys to delete, proceed with deletion
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️ Cleared ${allKeys.length} album cache entries.`);
    } else {
      console.log("ℹ️ No matching album cache keys found.");
    }

    console.log("✅ Album cache cleared.");
  } catch (error) {
    console.error("❌ Error clearing album cache:", error);
  }
};


// clear music cache
exports.clearMusicCache = async (musicId) => {
  try {
    console.log("🧹 Clearing music cache...");

    // Define the key patterns for music
    const paginatedPattern = "music:page:*";
    const filteredPattern = "music:page*:album*:search*:order*";

    // If a musicId is provided, fetch specific keys for that music entry
    const musicKeys = musicId ? await redisClient.keys(`music*_${musicId}`) : [];

    // Fetch all keys matching the patterns
    const allPaginatedKeys = await redisClient.keys(paginatedPattern);
    const allFilteredKeys = await redisClient.keys(filteredPattern);

    // Combine all keys into a unique set
    const allKeys = [...new Set([...allPaginatedKeys, ...allFilteredKeys, ...musicKeys])];

    // If there are any keys to delete, proceed with deletion
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️ Cleared ${allKeys.length} music cache entries.`);
    } else {
      console.log("ℹ️ No matching music cache keys found.");
    }

    console.log("✅ Music cache cleared.");
  } catch (error) {
    console.error("❌ Error clearing music cache:", error);
  }
};


// Clear posts cache
exports.clearPostsCache = async (postId) => {
  try {
    console.log("🧹 Clearing posts cache...");

    // Define the key patterns for posts
    const paginatedPattern = "posts:page:*";
    const filteredPattern = "posts:page*:user*";

    // If a postId is provided, fetch specific keys for that post entry
    const postKeys = postId ? await redisClient.keys(`post_${postId}`) : [];

    // Fetch all keys matching the patterns
    const allPaginatedKeys = await redisClient.keys(paginatedPattern);
    const allFilteredKeys = await redisClient.keys(filteredPattern);

    // Combine all keys into a unique set
    const allKeys = [...new Set([...allPaginatedKeys, ...allFilteredKeys, ...postKeys])];

    // If there are any keys to delete, proceed with deletion
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️ Cleared ${allKeys.length} posts cache entries.`);
    } else {
      console.log("ℹ️ No matching post cache keys found.");
    }

    console.log("✅ Posts cache cleared.");
  } catch (error) {
    console.error("❌ Error clearing posts cache:", error);
  }
};


// Clear users cache
exports.clearUsersCache = async (userId) => {
  try {
    console.log("🧹 Clearing users cache...");

    // ✅ Updated patterns to match new cache key format
    const basePattern = "users:page:*";
    const searchPattern = "users:page:*:size:*:search*";
    const guestPattern = "users:page:*:size:*:guest*";
    const datePattern = "users:page:*:size:*:from*";

    // If a specific user cache key exists (e.g., per-user detail)
    const userKeys = userId ? await redisClient.keys(`user_${userId}`) : [];

    // Gather all matching keys
    const allPaginatedKeys = await redisClient.keys(basePattern);
    const allSearchKeys = await redisClient.keys(searchPattern);
    const allGuestKeys = await redisClient.keys(guestPattern);
    const allDateKeys = await redisClient.keys(datePattern);

    // Merge and deduplicate
    const allKeys = [
      ...new Set([
        ...allPaginatedKeys,
        ...allSearchKeys,
        ...allGuestKeys,
        ...allDateKeys,
        ...userKeys,
      ]),
    ];

    // 🧹 Delete all matching keys
    if (allKeys.length > 0) {
      await redisClient.del(allKeys);
      console.log(`🗑️ Cleared ${allKeys.length} users cache entries.`);
    } else {
      console.log("ℹ️ No matching users cache keys found.");
    }

    console.log("✅ Users cache cleared.");
  } catch (error) {
    console.error("❌ Error clearing users cache:", error);
  }
};


