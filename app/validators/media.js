exports.validateMediaFields = (data) => {
    const { fileName, fileType } = data;

    if (!fileName || !fileType) {
        throw new Error('File name and type are required.');
    }

    return true;
};