require('dotenv').config();
const AWS = require('aws-sdk');
const chance = require('chance').Chance();
const velocityUtil = require('amplify-appsync-simulator/lib/velocity/util');

const a_random_user = () => {
  const firstName = chance.first({ nationality: 'en' });
  const lastName = chance.first({nationality: 'en' });
  const suffix = chance.string({ length: 4, pool: 'abcdefghijklmnopqrstuvwxyz' });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = chance.string({ length: 8 });
  const email = `${firstName}.${lastName}.${suffix}@appsyncmasterclass.com`;
  return { name, email, password };
};

const an_appsync_context = (identity, args, result) => {
  const util = velocityUtil.create([], new Date(), Object());

  const context = {
    arguments: args,
    identity,
    args,
    result
  };

  // appsync context has a bunch of different aliases, like args for arguments, util for utils, etc
  return {
    context, ctx: context, util, utils: util
  }

}

const an_authenticated_user = async () => {
  const { name, email, password } = a_random_user();

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

    const auth = await cognito.initiateAuth({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    }).promise();
    console.log(`[${email}] authenticated successfully`);

    return {
      username,
      email,
      name,
      idToken: auth.AuthenticationResult.IdToken,
      accessToken: auth.AuthenticationResult.AccessToken
    };
};

module.exports = {
  a_random_user,
  an_appsync_context,
  an_authenticated_user
};