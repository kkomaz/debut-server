const express = require('express')
const { setup } = require('radiks-server')

/**
 * Registered via single app
 * node index.js
*/
const app = express()

// Initial route
app.get('/', (req, res) => {
  res.send({ hi: 'there '})
})

const PORT = process.env.PORT || 5000;

app.listen((PORT), () => {
  console.log('listening on port ' + PORT);
});
