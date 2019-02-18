const axios = require('axios')
const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');

const migrate = async () => {
  const dappsToUpdate = []
  const mongo = await getDB(mongoURI)
  const dbDapp = await mongo.find({ radiksType: 'Dapp' })
  const dbDappToArray = await dbDapp.toArray()

  dbDappToArray.forEach((dapp) => {
    if (!dapp.name && dapp.url) {
      dappsToUpdate.push(dapp)
    }
  })

  for (dapp of dappsToUpdate) {
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
  }
}

migrate().then(() => {
  console.log('Done')
  process.exit()
}).catch((error) => {
  console.error(error)
  process.exist()
})
