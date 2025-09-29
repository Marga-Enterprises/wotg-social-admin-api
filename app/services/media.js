// services/mediaService.js

const spacesS3 = require('@config/aws'); // or relative path if not using aliases

// Function to get presigned URL for uploading images
exports.getPresignedUrlForImagesService = async ({ fileName, fileType }) => {
  const params = {
    Bucket: 'wotg',
    Key: `images/${fileName}`,
    Expires: 300,
    ContentType: fileType,
    ACL: 'public-read',
  };

  const uploadUrl = await spacesS3.getSignedUrlPromise('putObject', params);

  return {
    uploadUrl,
    fileUrl: `https://${params.Bucket}.${process.env.DO_SPACES_ENDPOINT}/images/${fileName}`,
  };
};



// Function to get presigned URL for uploading audios
exports.getPresignedUrlForAudiosService = async ({ fileName, fileType }) => {
  const params = {
    Bucket: 'wotg',
    Key: `audios/${fileName}`,
    Expires: 300,
    ContentType: fileType,
    ACL: 'public-read',
  };

  const uploadUrl = await spacesS3.getSignedUrlPromise('putObject', params);

  return {
    uploadUrl,
    fileUrl: `https://${params.Bucket}.${process.env.DO_SPACES_ENDPOINT}/audios/${fileName}`,
  };
}


// Function to get presigned URL for uploading videos
exports.getPresignedUrlForVideosService = async ({ fileName, fileType }) => {
  const params = {
    Bucket: 'wotg',
    Key: `videos/${fileName}`,
    Expires: 300,
    ContentType: fileType,
    ACL: 'public-read',
  };

  const uploadUrl = await spacesS3.getSignedUrlPromise('putObject', params);

  return {
    uploadUrl,
    fileUrl: `https://${params.Bucket}.${process.env.DO_SPACES_ENDPOINT}/videos/${fileName}`,
  };
};