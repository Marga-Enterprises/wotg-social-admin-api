// model imports 
const { Album } = require('@models');

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
} = require('@utils/clearRedisCache');

// services functions

// list of albums with pagination and optional search
exports.listAlbumsService = async (query) => {
    validateListAlbumsParams(query);

    let { pageIndex, pageSize, search } = query;

    pageIndex = parseInt(pageIndex);
    pageSize = parseInt(pageSize);
    const offset = (pageIndex - 1) * pageSize;
    const limit = pageSize;

    const cacheKey = `albums:page:${pageIndex}:size:${pageSize}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const whereClause = search ? {
        title: {
            [Op.iLike]: `%${search}%`
        }
    } : {};

    const { count, rows } = await Album.findAndCountAll({
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
        albums: rows,
    };

    await redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Cache for 1 hour

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

    await album.destroy();

    // clear album cache
    await clearAlbumCache(albumId);

    return true;
};