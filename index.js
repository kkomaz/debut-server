const express = require('express')
const { setup } = require('radiks-server')
const keys = require('./config/keys');
const expressWS = require('express-ws');
const { COLLECTION } = require('radiks-server/app/lib/constants');
const fs = require('fs');
const https = require('https');

/**
 * Registered via single app
 * node index.js
*/
const app = express()
expressWS(app)

setup({
  mongoDBUrl: keys.mongoURI
}).then((RadiksController) => {
  const db = RadiksController.DB
  const radiksData = db.collection(COLLECTION);

  app.use('/radiks', RadiksController);

  app.get('/', (req, res) => {
    res.send({ hi: 'there '})
  })

  app.get('/users/random', async (req, res) => {
    const users = await radiksData.aggregate([
      { $match:  {radiksType: 'BlockstackUser'} },
      { $sample: { size: 3 } }
    ]).toArray()
    res.send({ users })
  })
});

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log('listening on port ' + PORT);
});
