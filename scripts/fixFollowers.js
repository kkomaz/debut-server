const axios = require('axios')
const { getDB } = require('radiks-server');
const { mongoURI } = require('../config/keys');
const { lookupProfile } = require('blockstack')

const migrate = async () => {
  const mongo = await getDB(mongoURI)
  const radiksCollection = mongo.collection('radiks-server-data')
  const followers = await radiksCollection.find({ radiksType: 'Follow', $where: 'this.following.length >= 1'})
  const followersArray = await followers.toArray()
  const obj = {}

  for (follow of followersArray) {
    try {
      const currentUser = follow.username

      follow.following.forEach((username) => {
        if (obj[username]) {
          obj[username].push(currentUser)
        } else {
          obj[username] = [currentUser]
        }
      })
    } catch (e) {
      console.log(e.message)
    }
  }

  for (let property in obj) {
    await radiksCollection.update({
      radiksType: 'Follow',
      username: property
    }, {
      $set: {
        followers: obj[property],
        followersCount: obj[property].length
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

// await radiksCollection.update({
//   radiksType: 'BlockstackUser',
//   username: user.username
// }, {
//   $set: {
//     profileImgUrl: profileImgUrl
//   }
// })
