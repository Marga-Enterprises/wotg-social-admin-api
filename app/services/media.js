// services/mediaService.js

const spacesS3 = require('@config/aws'); // or relative path if not using aliases

exports.getPresignedUrlService = async ({ fileName, fileType }) => {
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
