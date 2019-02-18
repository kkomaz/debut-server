const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');

const migrate = async () => {
  const mongo = await getDB(mongoURI);

  /**
   * Call code to get your users from firebase
   * const users = await getUsersFromFirebase();
   */

  // Or, here is the actual list of users from Firebase at the moment:
  const users = {
    "-LV1HAQToANRvhysSClr": {
      "blockstackId": "1N1DzKgizU4rCEaxAU21EgMaHGB5hprcBM",
      "username": "kkomaz.id"
    },
    "-LVEhqvO-nK3NcXNZn41": {
      "blockstackId": "1A1yciqYj9ASHgVQ1ctDe2jyjhSrpa4b8Z",
      "username": "abramsgina.id"
    },
    "-LV_JFKZKaI6moZ1_CXC": {
      "blockstackId": "16KyUebBPPXgQLvA1f51bpsne3gL7Emdrc",
      "username": "jehunter5811.id"
    },
    "-LWtEhcpdyjW-h_jdVMQ": {
      "blockstackId": "1GHFo8Wz1ZrWi7YsSXoJeTgGm9kQvsgEdL",
      "username": "koreanizm1.id.blockstack"
    },
    "-LWz9EQsRgkZ-SiSXQlV": {
      "blockstackId": "1Maw8BjWgj6MWrBCfupqQuWANthMhefb2v",
      "username": "friedger.id"
    },
    "-LXok4Gp2LflFHuJLMBZ": {
      "blockstackId": "1EiAV8qdPDxGvJ3mHkVmkbyL8QpjyFHmtN",
      "username": "carriere.id.blockstack"
    },
    "-LXu3u6lVNU6UUTzoTIC": {
      "blockstackId": "13Z2T7UotSfFRciSYNzxxgTppGDDmiXSvN",
      "username": "robgroove.id.blockstack"
    },
    "-LXus2XyzYUZojhbCXju": {
      "blockstackId": "1NYcMiEDhxnKBCMRhctUfZgybZUF27r2qL",
      "username": "patrickwstanley.id"
    },
    "-LY2PEMJMyOqVHoVqET3": {
      "blockstackId": "1DEgVRD265SBPvfaQeNAVZr8Pmiz1v2Mkf",
      "username": "dweb2018.id.blockstack"
    },
    "-LY2PpRIuHIqQb7Ct7wj": {
      "blockstackId": "1LkCpS2aMsd5tQRSyfxJgiSQwDxSD2iZmF",
      "username": "u98u98uy8787t786t6rt765r765r76re75e.id.blockstack"
    },
    "-LY2PtpAW9xbVM0MxGI4": {
      "blockstackId": "13EWrxFrtcKgFas5kvm3kQhX86KLjhFpCM",
      "username": "jwiley.id.blockstack"
    },
    "-LY2QFb26zveO7G4uAh2": {
      "blockstackId": "1fHF3QADKT62js8BqHXmF31CFA1KUcTud",
      "username": "larry.id"
    },
    "LV_JFKZKaI6moZ1_CXY": {
      "blockstackId": "1789gBX7w1XFPeG5SFKkbfsUbrHvnTvYRC",
      "username": "markmhendrickson.id"
    }
  }

  const usersToInsert = Object.values(users).map((user) => {
    const { username } = user;
    const doc = {
      username,
      _id: username,
      radiksType: 'BlockstackUser',
    }
    const op = {
      updateOne: {
        filter: {
          _id: username,
        },
        update: {
          $setOnInsert: doc
        },
        upsert: true,
      }
    }
    return op;
  });

  // console.log(usersToInsert)

  await mongo.bulkWrite(usersToInsert);

}

migrate().then(() => {
  console.log('Done!');
  process.exit();
}).catch((error) => {
  console.error(error);
  process.exit();
})
