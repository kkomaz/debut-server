const { COLLECTION } = require('radiks-server/app/lib/constants');

const aggregateMentions = async (radiksData, query) => {
  const match = {
    $match: {
      radiksType: 'Mention',
      username: query.username,
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

  const childrenLookup = {
    $lookup: {
      from: COLLECTION,
      localField: 'parent_id',
      foreignField: '_id',
      as: 'children',
    }
  }

  const unwind = {
    $unwind: '$parent'
  }

  const childrenFilter = {
    $project: {
      id: "$_id",
      radiksType: "$radiksType",
      type: "$type",
      username: "$username",
      parent_id: "$parent_id",
      createdAt: "$createdAt",
      updatedAt: "$updatedAt",
      signingKeyId: "$signingKeyId",
      radiksSignature: "$radiksSignature",
      parent: {
        $filter: {
          input: '$children',
          as: 'child',
          cond: {
            $and: [
              { $eq: ["$$child.valid", true] }
            ]
          }
        }
      }
    }
  }

  const pipeline = [match, sort, limit, childrenLookup, childrenFilter, unwind]

  const mentions = await radiksData.aggregate(pipeline).toArray()

  return mentions
}

module.exports = aggregateMentions
