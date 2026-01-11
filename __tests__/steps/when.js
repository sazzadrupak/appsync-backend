require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const velocityMapper = require('amplify-appsync-simulator/lib/velocity/value-mapper/mapper');
const velocityTemplate = require('amplify-velocity-template');
const { escape } = require('querystring');

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

module.exports = {
  we_invoke_confirmUserSignup,
  a_user_signsup,
  we_invoke_an_appsync_template
};