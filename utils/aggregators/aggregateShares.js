const { COLLECTION } = require('radiks-server/app/lib/constants');

const aggregateShares = async (radiksData, query) => {
  const match = {
    $match: {
      radiksType: 'Share',
      valid: true,
      username: { "$in": query.username }
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
      localField: '_id',
      foreignField: 'share_id',
      as: 'children'
    },
  }

  const childrenFilter = {
    $project: {
      id: "$_id",
      radiksType: "$radiksType",
      text: "$text",
      username: "$username",
      imageFile: "$imageFile",
      valid: "$valid",
      createdAt: "$createdAt",
      updatedAt: "$updatedAt",
      signingKeyId: "$signingKeyId",
      radiksSignature: "$radiksSignature",
      commentCount: "$commentCount",
      comments: {
        $filter: {
          input: '$children',
          as: 'comment',
          cond: {
            $and: [
              { $eq: ["$$comment.valid", true] },
              { $eq: ["$$comment.radiksType", 'Comment'] },
            ]
          }
        }
      },
      votes: {
        $filter: {
          input: '$children',
          as: 'vote',
          cond: {
            $and: [
              { $eq: ["$$vote.radiksType", 'Vote'] },
            ]
          }
        }
      }
    }
  }

  const pipeline = [match, sort, limit, childrenLookup, childrenFilter]

  const shares = await radiksData.aggregate(pipeline).toArray()

  return shares
}

module.exports = aggregateShares
