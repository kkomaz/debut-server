const express = require('express')
const { setup } = require('radiks-server')
const keys = require('./config/keys');

/**
 * Registered via single app
 * node index.js
*/
const app = express()

// Initial route
app.get('/', (req, res) => {
  res.send({ hi: 'there '})
})

setup({
  mongoDBUrl: keys.mongoURI
}).then((RadiksController) => {
  app.use('/radiks', RadiksController);
});

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log('listening on port ' + PORT);
});
