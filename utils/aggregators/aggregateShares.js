const { COLLECTION } = require('radiks-server/app/lib/constants');

const aggregateShares = async (radiksData, query) => {
  const match = {
    $match: {
      radiksType: 'Share',
      valid: true
    }
  }

  if (query.username) {
    match.$match.username = query.username;
  }

  const sort = {
    $sort: { createdAt: -1 },
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

  const pipeline = [match, offset, sort, limit, commentsLookup]

  const shares = await radiksData.aggregate(pipeline).toArray()

  return shares
}

module.exports = aggregateShares
