// model imports 
const { Album, Music } = require('@models');

// validators
const {
    validateAlbumFields,
    validateAlbumId,
    validateListAlbumsParams,
} = require('@validators/album');

// redis client
const redisClient = require('@config/redis');

// utility redis client
const {
    clearAlbumCache,
    clearMusicCache
} = require('@utils/clearRedisCache');

// sequelize operators
const { Op } = require('sequelize');

// services functions

// list of albums with pagination and optional search
exports.listAlbumsService = async (query) => {
  // ✅ Step 1: Validate and normalize params
  validateListAlbumsParams(query);

  let { pageIndex = 1, pageSize = 10, search = '' } = query;

  pageIndex = Math.max(1, parseInt(pageIndex, 10) || 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100); // safe limit between 1–100
  const offset = (pageIndex - 1) * pageSize;

  // ✅ Step 2: Build a unique cache key
  const cacheKey = `albums:page:${pageIndex}:size:${pageSize}${search ? `:search:${search.trim()}` : ''}`;

  const cachedData = await redisClient.get(cacheKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  // ✅ Step 3: Build dynamic filters (use Op.like for MariaDB/MySQL)
  const whereClause = {};
  if (search && search.trim()) {
    whereClause.title = {
      [Op.like]: `%${search.trim()}%`, // ✅ MySQL uses LIKE (not ILIKE)
    };
  }

  // ✅ Step 4: Query database
  const { count, rows } = await Album.findAndCountAll({
    where: whereClause,
    offset,
    limit: pageSize,
    order: [['created_at', 'DESC']],
  });

  // ✅ Step 5: Pagination logic
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ✅ Step 6: Construct result
  const result = {
    totalItems: count,
    totalPages,
    currentPage: pageIndex,
    hasNextPage: pageIndex < totalPages,
    hasPrevPage: pageIndex > 1,
    albums: rows,
  };

  // ✅ Step 7: Cache result for 1 hour
  await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);

  return result;
};



// get album by id
exports.getAlbumByIdService = async (albumId) => {
    validateAlbumId(albumId);

    const cacheKey = `album_${albumId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    };

    const album = await Album.findByPk(albumId);

    if (!album) {
        throw new Error('Album not found');
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(album)); // Cache for 1 hour

    return album;
};


// create a new album
exports.createAlbumService = async (data) => {
    validateAlbumFields(data);

    const newAlbum = await Album.create({
        title: data.title,
        cover_image: data.cover_image,
        artist_name: 'WOTG Praise',
        release_date: data.release_date,
        type: 'album',
        label: 'WOTG Praise'
    });

    // clear album cache
    await clearAlbumCache();

    return newAlbum;
};


// update an existing album
exports.updateAlbumService = async (albumId, data) => {
    validateAlbumId(albumId);
    validateAlbumFields(data);

    const album = await Album.findByPk(albumId);

    if (!album) {
        throw new Error('Album not found');
    }

    await album.update({
        title: data.title,
        cover_image: data.cover_image,
        release_date: data.release_date,
    });

    // clear album cache
    await clearAlbumCache(albumId);

    return album;
}


// delete an album
exports.deleteAlbumService = async (albumId) => {
    validateAlbumId(albumId);

    const album = await Album.findByPk(albumId);

    if (!album) {
        throw new Error('Album not found');
    }

    // also delete all associated music entries
    await Music.destroy({ where: { album_id: albumId } });

    await album.destroy();

    // clear album cache
    await clearAlbumCache(albumId);
    await clearMusicCache();

    return true;
};