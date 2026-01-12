const chance = require('chance').Chance();
const path = require('path');
const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

describe('Given an authenticated user', () => {
  let user, profile;

  beforeAll(async () => {
    user = await given.an_authenticated_user();
  });

  it('The user can fetch his profile with getMyProfile query', async () => {
    profile = await when.a_user_calls_getMyProfile(user);

    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: null,
      location: null,
      website: null,
      birthDate: null,
      createdAt: expect.stringMatching(/\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCount: 0
    });

    const [firstName, lastName] = user.name.split(' ')
    expect(profile.screenName).toContain(firstName)
    expect(profile.screenName).toContain(lastName)
  });

  it('The user can get an URL to upload new profile image', async () => {
    const uploadUrl = await when.a_user_requests_image_upload_url(user, '.png', 'image/png');

    const bucketName = process.env.BUCKET_NAME;
    const regex = new RegExp(`https://${bucketName}.s3-accelerate.amazonaws.com/${user.username}/.*\\.png\\?.*X-Amz-Algorithm=AWS4-HMAC-SHA256.*X-Amz-Signature=.*`);
    expect(uploadUrl).toMatch(regex);

    const filePath = path.join(__dirname, '../../data/logo.png');
    await then.user_can_upload_image_to_signed_url(uploadUrl, filePath, 'image/png');

    // Extract the image key from the upload URL
    const urlParts = uploadUrl.split('?')[0].split('/');
    const imageKey = urlParts.slice(3).join('/'); // Remove https://bucket.s3-accelerate.amazonaws.com/
    await then.user_can_download_image_from(imageKey);
  });

  it('The user can edit his profile with updateMyProfile mutation', async () => {
    const newName = chance.first()
    const input = {
      name: newName,
    }
    const newProfile = await when.a_user_calls_updateMyProfile(user, input);

    expect(newProfile).toMatchObject({
      ...profile,
      name: newName,
    });
  });
});