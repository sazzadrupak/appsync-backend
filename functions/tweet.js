const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const { TweetTypes } = require("../lib/constants");
const ulid = require("ulid");

const { USERS_TABLE, TWEETS_TABLE, TIMELINES_TABLE } = process.env;

module.exports.handler = async (event) => {
  const { text } = event.arguments;
  const { username } = event.identity;
  const id = ulid.ulid();
  const timestamp = new Date().toJSON();

  const newTweet = {
    __typename: TweetTypes.TWEET,
    id,
    creator: username,
    createdAt: timestamp,
    text,
    replies: 0,
    retweets: 0,
    likes: 0,
  };

  const input = {
    TransactItems: [
      {
        Put: {
          TableName: TWEETS_TABLE,
          Item: newTweet,
        },
      }, {
        Put: {
          TableName: TIMELINES_TABLE,
          Item: {
            userId: username,
            tweetId: id,
            timestamp,
          },
        },
      }, {
        Update: {
          TableName: USERS_TABLE,
          Key: { id: username },
          UpdateExpression: 'ADD tweetsCount :one',
          ExpressionAttributeValues: {
            ':one': 1
          },
          ConditionExpression: 'attribute_exists(id)',
        }
      }
    ],
  };
  await docClient.send(new TransactWriteCommand(input));
  return newTweet;
};