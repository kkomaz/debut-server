const axios = require('axios')
const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');
const { lookupProfile } = require('blockstack')

const migrate = async () => {
  const mongo = await getDB('mongodb://heroku_hg3snx30:ktijof3rvfmfpq5frvsihge3fb@ds225375.mlab.com:25375/heroku_hg3snx30')
  const radiksCollection = mongo.collection('radiks-server-data')
  const basicInformation = await radiksCollection.find({ radiksType: 'BasicInformation' })
  const basicInformationArray = await basicInformation.toArray()

  for (let i = 0; i < basicInformationArray.length; i++) {
    await radiksCollection.update({
      radiksType: 'BlockstackUser',
      username: basicInformationArray[i].username
    }, {
      $set: {
        description: basicInformationArray[i].description
      }
    })
  }
}

migrate().then(() => {
  console.log('Done')
  process.exit()
}).catch((error) => {
  console.error(error)
  throw new Error(error.message)
})
