// validateMusicFields function to ensure music fields are correct
exports.validateMusicFields = (data) => {
    const {
        title,
        album_id,
        audio_url,
        genre,
    } = data;

    if (!title || !audio_url) {
        throw new Error('Music title and audio URL are required.');
    };

    if (album_id && isNaN(album_id)) {
        throw new Error('Invalid album_id: must be a number.');
    };

    if (genre && typeof genre !== 'string') {
        throw new Error('Invalid genre: must be a string.');
    };

    return true;
};


// validateMusicId function to ensure musicId is a valid number
exports.validateMusicId = (musicId) => {
    if (!musicId || isNaN(musicId)) {
        throw new Error('Invalid musicId: must be a number.');
    }

    return true;
};


// validateListMusicParams function to validate query parameters for listing music
exports.validateListMusicParams = (query) => {
    const { pageIndex, pageSize, album_id } = query;

    if (
        !pageIndex ||
        !pageSize ||
        isNaN(pageIndex) ||
        isNaN(pageSize) ||
        pageIndex < 0 ||
        pageSize <= 0
    ) {
        throw new Error('Invalid pagination parameters.');
    }

    if (album_id && isNaN(album_id)) {
        throw new Error('Invalid album_id: must be a number.');
    }

    return true;
};