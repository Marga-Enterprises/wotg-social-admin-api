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

