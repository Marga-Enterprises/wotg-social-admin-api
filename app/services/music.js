// model imports
const { Music, Album } = require('@models');

// validators
const {
    validateMusicFields,
    validateMusicId,
    validateListMusicParams,
} = require('@validators/music');

// redis client
const redisClient = require('@config/redis');

// utility redis client
const {
    clearMusicCache,
} = require('@utils/clearRedisCache');

// sequelize operator
const { Op } = require('sequelize');


// services functions

// list of music with pagination and optional search
exports.listMusicService = async (query) => {
  // ✅ Step 1: Validate and normalize params
  validateListMusicParams(query);

  let {
    pageIndex = 1,
    pageSize = 10,
    albumId,
    search,
    orderBy = 'created_at',
    orderDirection = 'DESC',
  } = query;

  pageIndex = Math.max(1, parseInt(pageIndex, 10) || 1);
  pageSize = Math.min(Math.max(parseInt(pageSize, 10) || 10, 1), 100);
  const offset = (pageIndex - 1) * pageSize;

  // ✅ Step 2: Safe values and cache key (your format)
  const safeAlbumId = albumId || '';
  const safeSearch = search?.trim() || '';
  const safeOrderBy = ['created_at', 'title', 'play_count'].includes(orderBy)
    ? orderBy
    : 'created_at';
  const safeDirection = ['ASC', 'DESC'].includes(orderDirection.toUpperCase())
    ? orderDirection.toUpperCase()
    : 'DESC';

  // ✅ Build cache key in your requested format
  const cacheKey = `music:page:${pageIndex}:${pageSize}${safeAlbumId ? `:album:${safeAlbumId}` : ""}${safeSearch ? `:search:${safeSearch}` : ""}${safeOrderBy ? `:order:${safeOrderBy}` : ""}`;

  // ✅ Step 3: Try cache first
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // ✅ Step 4: Build dynamic filters
  const whereClause = {};
  if (albumId) whereClause.album_id = albumId;

  if (search) {
    // Case-insensitive LIKE for MySQL / MariaDB
    whereClause.title = { [Op.like]: `%${search}%` };
  }

  // ✅ Step 5: Fetch data
  const { count, rows } = await Music.findAndCountAll({
    where: whereClause,
    offset,
    limit: pageSize,
    order: [[safeOrderBy, safeDirection]],
    include: [
      {
        model: Album,
        attributes: ['id', 'title', 'artist_name', 'cover_image'],
      },
    ],
    distinct: true, // ensures accurate count when using JOIN
  });

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  // ✅ Step 6: Prepare result
  const result = {
    totalItems: count,
    totalPages,
    currentPage: pageIndex,
    hasNextPage: pageIndex < totalPages,
    hasPrevPage: pageIndex > 1,
    musics: rows,
  };

  // ✅ Step 7: Cache result (1 hour)
  await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);

  return result;
};


// get music by id
exports.getMusicByIdService = async (musicId) => {
    validateMusicId(musicId);

    const cacheKey = `music_${musicId}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const music = await Music.findByPk(musicId, {
        include: [{
            model: Album,
            attributes: ['id', 'title', 'artist_name', 'cover_image'],
        }],
    });

    if (!music) {
        throw new Error('Music not found');
    }

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(music)); // Cache for 1 hour

    return music;
};


// create a new music entry
exports.createMusicService = async (data) => {
    validateMusicFields(data);

    const newMusic = await Music.create({
        title: data.title,
        artist_name: 'WOTG Praise',
        album_id: data.album_id || null,
        audio_url: data.audio_url,
        duration: data.duration,
        track_number: data.track_number || null,
        is_explicit: data.is_explicit || false,
        genre: data.genre || null,
    });

    // clear music cache
    await clearMusicCache();

    return newMusic;
};


// update an existing music entry
exports.updateMusicService = async (musicId, data) => {
    validateMusicId(musicId);
    validateMusicFields(data);

    const music = await Music.findByPk(musicId);

    if (!music) {
        throw new Error('Music not found');
    }

    await music.update({
        title: data.title,
        album_id: data.album_id || null,
        audio_url: data.audio_url,
        duration: data.duration,
        track_number: data.track_number || null,
        is_explicit: data.is_explicit || false,
        genre: data.genre || null,
    });

    // clear music cache
    await clearMusicCache(musicId);

    return music;
};


// delete a music entry
exports.deleteMusicService = async (musicId) => {
    validateMusicId(musicId);

    const music = await Music.findByPk(musicId);

    if (!music) {
        throw new Error('Music not found');
    }

    await music.destroy();

    // clear music cache
    await clearMusicCache();

    return { message: 'Music deleted successfully' };
};