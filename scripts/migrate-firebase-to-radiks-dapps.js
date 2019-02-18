const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');
const { dapps } = require('./dapp');

/* eslint-disable */
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
          .replace(/[xy]/g,
                   (c) => {
                     const r = Math.random() * 16 | 0;
                     const v = c === 'x' ? r : (r & 0x3 | 0x8);
                     return v.toString(16);
                   });
}

const migrate = async () => {
  const mongo = await getDB('mongodb://localhost:27017/radiks-server');

  /**
   * Call code to get your users from firebase
   * const users = await getUsersFromFirebase();
   */

  // Or, here is the actual list of users from Firebase at the moment:
  // const dapps = DAPPS

  const usersToInsert = Object.values(dapps).map((dapp) => {
    const { description, icons, name, start_url, url } = dapp
    const newId = generateUUID()

    const doc = {
      description,
      icons,
      name,
      start_url,
      url,
      _id: newId,
      radiksType: 'Dapp',
    }

    const op = {
      updateOne: {
        filter: {
          _id: newId,
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
