const S3 = require('aws-sdk/clients/s3');
const s3 = new S3({ useAccelerateEndpoint: true });
const ulid = require('ulid');

const { BUCKET_NAME } = process.env;

module.exports.handler = async (event) => {
  const id = ulid.ulid();
  let key = `${event.identity.username}/${id}`;

  const extension = event.arguments.extension
  if (extension) {
    if (extension.startsWith('.')) {
      key += extension;
    } else {
      key += `.${extension}`;
    }
  }

  const contentType = event.arguments.contentType || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    throw new Error('Content type should be an image type');
  }

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ACL: 'public-read',
    ContentType: contentType,
    Expires: 60, // URL expiration time in seconds
  };

  const signedUrl = s3.getSignedUrl('putObject', params); // getSignedUrl does not make any call to S3, it's completely generated locally
  // you can use s3.createPresignedPost for more complex scenarios and add more conditions like file size, content type, etc.
  return signedUrl;
};