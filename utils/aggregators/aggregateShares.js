const { COLLECTION } = require('radiks-server/app/lib/constants');

const aggregateShares = async (radiksData, query) => {
  const match = {
    $match: {
      radiksType: 'Share',
      valid: true,
      username: { "$in": query.username }
    }
  }

  // if (query.username) {
  //   match.$match.username = query.username;
  // }

  if (query.username) {

  }

  const sort = {
    $sort: { createdAt: query.sort || -1 },
  }

  const parsedLimit = parseInt(query.limit)

  const limit = {
    $limit: parsedLimit || 10,
  }

  const parsedOffset = parseInt(query.offset)

  const offset = {
    $skip: parsedOffset
  }

  const commentsLookup = {
    $lookup: {
      from: COLLECTION,
      localField: '_id',
      foreignField: 'share_id',
      as: 'comments'
    }
  }

  const votesLookup = {
    $lookup: {
      from: COLLECTION,
      localField: '_id',
      foreignField: 'vote_share_id',
      as: 'votes'
    }
  }

  const pipeline = [match, offset, sort, limit, commentsLookup, votesLookup]

  const shares = await radiksData.aggregate(pipeline).toArray()

  return shares
}

module.exports = aggregateShares
