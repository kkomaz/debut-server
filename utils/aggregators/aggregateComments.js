const { COLLECTION } = require('radiks-server/app/lib/constants');

const aggregateComments = async (radiksData, query) => {
  const match = {
    $match: {
      radiksType: 'Comment',
      valid: true,
      parent_creator: query.parent_creator,
      creator: { "$nin": [query.parent_creator] }
    }
  }

  if (query.lt) {
    match.$match.createdAt = {
      $lt: parseInt(query.lt, 10),
    };
  }

  if (query.gte) {
    match.$match.createdAt = {
      $gte: query.gte,
    };
  }

  const sort = {
    $sort: { createdAt: query.sort || -1 },
  }

  const parsedLimit = parseInt(query.limit)

  const limit = {
    $limit: parsedLimit || 10,
  }


  const pipeline = [match, sort, limit]

  const comments = await radiksData.aggregate(pipeline).toArray()

  return comments
}

module.exports = aggregateComments
