const AWS = require('aws-sdk');

const {
  DO_SPACES_KEY,
  DO_SPACES_SECRET,
  DO_SPACES_ENDPOINT,
} = process.env;

const spacesS3 = new AWS.S3({
  endpoint: new AWS.Endpoint(DO_SPACES_ENDPOINT),
  accessKeyId: DO_SPACES_KEY,
  secretAccessKey: DO_SPACES_SECRET,
  signatureVersion: 'v4',
});

module.exports = spacesS3;
