const express = require('express')
const { setup } = require('radiks-server')
const keys = require('./config/keys');

/**
 * Registered via single app
 * node index.js
*/
const app = express()

setup({
  mongoDBUrl: keys.mongoURI
}).then((RadiksController) => {
  app.use('/radiks', RadiksController);

  app.get('/', (req, res) => {
    res.send({ hi: 'there '})
  })
});

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log('listening on port ' + PORT);
});
