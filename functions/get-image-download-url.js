const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = new S3Client({ useAccelerateEndpoint: true });

const { BUCKET_NAME } = process.env;

module.exports.handler = async (event) => {
  const { imageKey } = event.arguments;

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: imageKey,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return signedUrl;
};