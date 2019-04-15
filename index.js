const express = require('express')
const { setup } = require('radiks-server')
const keys = require('./config/keys');
const expressWS = require('express-ws');
const { COLLECTION } = require('radiks-server/app/lib/constants');
const fs = require('fs');
const https = require('https');
const aggregateShares = require('./utils/aggregators/aggregateShares');
const aggregateComments = require('./utils/aggregators/aggregateComments');
const aggregateMentions = require('./utils/aggregators/aggregateMentions');
/**
 * Registered via single app
 * node index.js
*/
const app = express()
expressWS(app)

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

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

  app.put('/comment', async (req, res) => {
    const shareId = req.query.share_id
    const comments = await radiksData.find({ radiksType: 'Comment', share_id: shareId }).toArray()

    if (comments.length === 0) {
      res.status(404).send({ error: 'Not Found' })
    } else {
      radiksData.updateMany(
        { radiksType: 'Comment', share_id: shareId },
        { $set: { valid: false } }
      )

      res.json({ success: true })
    }
  })

  app.get('/shares', async (req, res) => {
    let shares = await aggregateShares(radiksData, req.query)
    res.json({ shares })
  })

  app.get('/comments', async (req, res) => {
    let comments = await aggregateComments(radiksData, req.query)
    res.json({ comments })
  })

  app.get('/mentions', async (req, res) => {
    let mentions = await aggregateMentions(radiksData, req.query)
    res.json({ mentions })
  })
});

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log('listening on port ' + PORT);
});
