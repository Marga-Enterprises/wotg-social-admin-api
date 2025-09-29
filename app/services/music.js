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

// services functions

// list of music with pagination and optional search
exports.listMusicService = async (query) => {
    validateListMusicParams(query);

    let { pageIndex, pageSize, albumId, search } = query;

    pageIndex = parseInt(pageIndex);
    pageSize = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const cacheKey = `music:page:${pageIndex}:size:${pageSize}:album:${albumId || 'all'}:search:${search || 'none'}:order:createdAt`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const whereClause = {};
    if (albumId) {
        whereClause.album_id = albumId;
    }

    if (search) {
        whereClause.title = {
            [Op.iLike]: `%${search}%`
        };
    }

    const { count, rows } = await Music.findAndCountAll({
        where: whereClause,
        offset,
        limit,
        order: [['created_at', 'DESC']],
        include: [{
            model: Album,
            attributes: ['id', 'title', 'artist_name', 'cover_image'],
        }],
    });

    const totalPages = Math.ceil(count / pageSize);

    const result = {
        totalItems: count,
        totalPages,
        currentPage: pageIndex,
        music: rows,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

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