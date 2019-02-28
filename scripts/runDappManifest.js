const axios = require('axios')
const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');

const migrate = async () => {
  const dappsToUpdate = []
  const mongo = await getDB('mongodb://localhost:27017/radiks-server')
  const dbDapp = await mongo.find({ radiksType: 'Dapp' })
  const dbDappToArray = await dbDapp.toArray()

  dbDappToArray.forEach((dapp) => {
    if (!dapp.icons && dapp.url) {
      dappsToUpdate.push(dapp)
    }
  })

  for (dapp of dappsToUpdate) {
    try {
      const { data } = await axios.get(`${dapp.url}/manifest.json`)
      await mongo.update({
        "url": dapp.url
      }, {
        $set: {
          "description": data.description,
          "icons": data.icons,
          "name": data.name,
          "start_url": data.start_url ? data.start_url : data.url
        }
      }, {
        upsert: true
      })
    } catch (e) {
      console.log(dapp)
      console.log(e.message)
    }
  }
}

migrate().then(() => {
  console.log('Done')
  process.exit()
}).catch((error) => {
  console.error(error)
  throw new Error(error.message)
})
