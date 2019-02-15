const axios = require('axios')
const { getDB } = require('radiks-server');

const migrate = async () => {
  const dappsToUpdate = []
  const mongo = await getDB('mongodb://localhost:27017/radiks-server')
  const dbDapp = await mongo.find({ radiksType: 'Dapp' })
  const dbDappToArray = await dbDapp.toArray()

  dbDappToArray.forEach((dapp) => {
    if (!dapp.name && dapp.url) {
      dappsToUpdate.push(dapp)
    }
  })

  for (dapp of dappsToUpdate) {
    const { data } = await axios.get(`${dapp.url}/manifest.json`)
    const mongoDapp = await mongo.find({ radiksType: 'Dapp', url: dapp.url }).next()
    dbDapp.update(
      { url: mongoDapp.url },
      {
        name: data.name,
        description: data.description,
        start_url: data.start_url,
        url: data.url || data.start_url,
        icons: data.icons
      },
      { upsert: true }
    )
  }
}

migrate().then(() => {
  console.log('Done')
  process.exit()
}).catch((error) => {
  console.error(error)
  process.exist()
})
