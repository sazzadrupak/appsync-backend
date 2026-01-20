require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper');
const velocityTemplate = require('amplify-velocity-template');
const GraphQL = require('../lib/graphql');

const we_invoke_confirmUserSignup = async (username, name, email) => {
  const handler = require('../../functions/confirm-user-signup').handler;

  const context = {};

  const event = {
    "version": "1",
    "region": process.env.AWS_REGION,
    "userPoolId": process.env.COGNITO_USER_POOL_ID,
    "userName": username,
    "triggerSource": "PostConfirmation_ConfirmSignUp",
    "request": {
      "userAttributes": {
        "sub": username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        "email_verified": "false",
        "name": name,
        "email": email
      }
    },
    "response": {}
  };

  await handler(event, context);
};

const a_user_signsup = async (password, name, email) => {
  const cognito = new AWS.CognitoIdentityServiceProvider();

  const usserPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResp = await cognito.signUp({
    ClientId: clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'name',
        Value: name
      }
    ]
  }).promise();

  const username = signUpResp.UserSub;
  console.log(`User signed up with username [${username}]`);

  // this allows to skip the verification code and confirm the user in Cognito
  await cognito.adminConfirmSignUp({
    UserPoolId: usserPoolId,
    Username: username
  }).promise();

  console.log(`[${email}] confirmed signup`);

  return { username, email, name };
}

const we_invoke_an_appsync_template = (templatePath, context) => {
  const template = fs.readFileSync(templatePath, { encoding: 'utf-8' });
  const abstractSyntaxTree = velocityTemplate.parse(template);
  const compiler = new velocityTemplate.Compile(abstractSyntaxTree, {
    valueMapper: velocityMapper.map,
    escape: false
  });
  return JSON.parse(compiler.render(context));
}

const a_user_calls_getMyProfile = async (user) => {
  const getMyProfile = `query getMyProfile {
    getMyProfile {
      backgroundImageUrl
      bio
      birthDate
      createdAt
      followersCount
      followingCount
      id
      imageUrl
      likesCount
      location
      name
      screenName
      tweetsCount
      website
    }
  }`;

  const data = await GraphQL(process.env.API_URL, getMyProfile, {}, user.accessToken);
  const profile = data.getMyProfile;

  console.log(`Fetched profile for user [${user.username}]`);
  return profile;
}

const a_user_calls_updateMyProfile = async (user, input) => {
  const updateMyProfile = `mutation updateMyProfile($input: ProfileInput!) {
    updateMyProfile(newProfile: $input) {
      backgroundImageUrl
      bio
      birthDate
      createdAt
      followersCount
      followingCount
      id
      imageUrl
      likesCount
      location
      name
      screenName
      tweetsCount
      website
    }
  }`;

  const variables = { input };

  const data = await GraphQL(process.env.API_URL, updateMyProfile, variables, user.accessToken);
  const profile = data.updateMyProfile;

  console.log(`Edited profile for user [${user.username}]`);
  return profile;
}

const we_invoke_getImageUploadUrl = async (username, extension, contentType) => {
  const handler = require('../../functions/get-image-upload-url').handler;

  const context = {};

  const event = {
    identity: {
      username
    },
    arguments: {
      extension,
      contentType
    }
  };

  return await handler(event, context);
}

const a_user_requests_image_upload_url = async (user, extension, contentType) => {
  const getImageUploadUrl = `query getImageUploadUrl($extension: String, $contentType: String) {
    getImageUploadUrl(extension: $extension, contentType: $contentType)
  }`;

  const variables = { extension, contentType };

  const data = await GraphQL(process.env.API_URL, getImageUploadUrl, variables, user.accessToken);
  const url = data.getImageUploadUrl;

  console.log(`[${user.username}] - got image upload url`);
  return url;
}

const we_invoke_tweet = async (username, text) => {
  const handler = require('../../functions/tweet').handler;

  const context = {};
  const event = {
    identity: {
      username
    },
    arguments: {
      text
    }
  };

  return await handler(event, context);
};

const a_user_calls_tweet = async (user, text) => {
  const tweetMutation = `mutation tweet($text: String!) {
    tweet(text: $text) {
      id
      profile {
        id
        name
        screenName
      }
      createdAt
      text
      replies
      likes
      retweets
    }
  }`;

  const variables = { text };

  const data = await GraphQL(process.env.API_URL, tweetMutation, variables, user.accessToken);
  const newTweet = data.tweet;

  console.log(`[${user.username}] - tweeted [${newTweet.id}]`);
  return newTweet;
}

const a_user_calls_getTweets = async (user, userId, limit, nextToken) => {
  const getTweets = `query getTweets($userId: ID!, $limit: Int!, $nextToken: String) {
    getTweets(userId: $userId, limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        id
        createdAt
        profile {
          id
          name
          screenName
        }
        ... on Tweet {
          text
          replies
          likes
          retweets
        }
      }
    }
  }`;

  const variables = { userId, limit, nextToken };

  const data = await GraphQL(process.env.API_URL, getTweets, variables, user.accessToken);
  const result = data.getTweets;

  console.log(`[${user.username}] - fetched tweets`);
  return result;
}

const a_user_calls_getMyTimeline = async (user, limit, nextToken) => {
  const getMyTimeline = `query getMyTimeline($limit: Int!, $nextToken: String) {
    getMyTimeline(limit: $limit, nextToken: $nextToken) {
      nextToken
      tweets {
        id
        createdAt
        profile {
          id
          name
          screenName
        }
        ... on Tweet {
          text
          replies
          likes
          retweets
        }
      }
    }
  }`;

  const variables = { limit, nextToken };

  const data = await GraphQL(process.env.API_URL, getMyTimeline, variables, user.accessToken);
  const result = data.getMyTimeline;

  console.log(`[${user.username}] - fetched timeline`);
  return result;
}

module.exports = {
  we_invoke_confirmUserSignup,
  a_user_signsup,
  we_invoke_an_appsync_template,
  a_user_calls_getMyProfile,
  a_user_calls_updateMyProfile,
  we_invoke_getImageUploadUrl,
  a_user_requests_image_upload_url,
  we_invoke_tweet,
  a_user_calls_tweet,
  a_user_calls_getTweets,
  a_user_calls_getMyTimeline
};