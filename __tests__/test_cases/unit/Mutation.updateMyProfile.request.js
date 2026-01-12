const given = require('../../steps/given');
const when = require('../../steps/when');
const then = require('../../steps/then');

const chance = require('chance').Chance();
const path = require('path');

describe('Mutation.updateMyProfile request template', () => {
  it("should use username as 'id'", () => {
    const templatePath = path.resolve(__dirname, '../../../mapping-templates/Mutation.updateMyProfile.request.vtl');

    const username = chance.guid();
    const newProfile = {
      name: 'New Name',
      imageUrl: null,
      backgroundImageUrl: null,
      bio: 'This is my new bio',
      location: null,
      website: null,
      birthDate: null
    };
    const context = given.an_appsync_context({ username }, { newProfile});
    const result = when.we_invoke_an_appsync_template(templatePath, context);

    expect(result).toEqual({
  "version" : "2018-05-29",
  "operation" : "UpdateItem",
  "key": {
    "id" : { "S" : username }
  },
  "update" : {
    "expression" : "set #name = :name, imageUrl = :imageUrl, backgroundImageUrl = :backgroundImageUrl, bio = :bio, #location = :location, website = :website, birthDate = :birthDate",
    "expressionNames" : {
      "#name" : "name",
      "#location" : "location"
    },
    "expressionValues" : {
      ":name" : { "S" : 'New Name' },
      ":imageUrl" : { NULL: true },
      ":backgroundImageUrl" : { NULL: true },
      ":bio" : { "S" : 'This is my new bio' },
      ":location" : { NULL: true },
      ":website" : { NULL: true },
      ":birthDate" : { NULL: true }
    }
  },
  "condition" : {
    "expression" : "attribute_exists(id)"
  }
});
  });
});