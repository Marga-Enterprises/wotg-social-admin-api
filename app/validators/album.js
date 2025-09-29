// validateAlbumFields function to ensure album fields are correct
exports.validateAlbumFields = (data) => {
    const { title, cover_image } = data;

    if (!title || !cover_image) {
        throw new Error('Album title and cover image are required.');
    };

    return true;
};


// validateAlbumId function to ensure albumId is a valid number
exports.validateAlbumId = (albumId) => {
    if (!albumId || isNaN(albumId)) {
        throw new Error('Invalid albumId: must be a number.');
    }

    return true;
};


// validateListAlbumsParams function to validate query parameters for listing albums
exports.validateListAlbumsParams = (query) => {
    const { pageIndex, pageSize } = query;

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

    return true;
};