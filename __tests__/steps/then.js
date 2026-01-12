require('dotenv').config();
const AWS = require('aws-sdk');
const http = require('axios');
const fs = require('fs');

const user_exists_in_UsersTable = async (id) => {
  const DynamoDB = new AWS.DynamoDB.DocumentClient();

  console.log(`Checking if user [${id}] exists in UsersTable [${process.env.USERS_TABLE}]`);
  const resp = await DynamoDB.get({
    TableName: process.env.USERS_TABLE,
    Key: { id }
  }).promise();

  expect(resp.Item).toBeTruthy();
  return resp.Item;
};

const user_can_upload_image_to_signed_url = async (uploadUrl, filePath, contentType) => {
  const data = fs.readFileSync(filePath);
  console.log(`Uploading image to signed URL [${uploadUrl}] from file [${filePath}]`);
  await http({
    method: 'PUT',
    url: uploadUrl,
    headers: {
      'Content-Type': contentType
    },
    data
  });
  console.log(`Successfully uploaded image to signed URL [${uploadUrl}]`);
};

const user_can_download_image_from = async (imageKey) => {
  // Construct direct S3 URL for public objects
  const bucketName = process.env.BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  const downloadUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${imageKey}`;
  
  const resp = await http(downloadUrl);
  console.log(`Downloaded image from URL [${downloadUrl}] with status code [${resp.status}]`);
  return resp.data;
};

module.exports = {
  user_exists_in_UsersTable,
  user_can_upload_image_to_signed_url,
  user_can_download_image_from
};