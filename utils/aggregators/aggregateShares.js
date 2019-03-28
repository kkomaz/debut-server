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

  const commentsLookup = {
    $lookup: {
      from: COLLECTION,
      localField: '_id',
      foreignField: 'share_id',
      as: 'comments'
    },
  }

  // const commentsFilter = {
  //   $project: {
  //     id: "$_id",
  //     radiksType: "$radiksType",
  //     text: "text",
  //     username: "$username",
  //     imageFile: "$imageFile",
  //     valid: "$valid",
  //     createdAt: "$createdAt",
  //     updatedAt: "$updatedAt",
  //     signingKeyId: "$signingKeyId",
  //     radiksSignature: "$radiksSignature",
  //     commentCount: "$commentCount",
  //     comments: {
  //       $filter: {
  //         input: '$comments',
  //         as: 'comment',
  //         cond: [
  //           {
  //             $and: [
  //               { $eq: ["$$comment.radiksType", "Comment"]},
  //               { $eq: ["$$comment.valid", true]}
  //             ]
  //           }
  //         ]
  //       }
  //     }
  //   }
  // }

  const commentsFilter = {
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
          input: '$comments',
          as: 'comment',
          cond: { $eq: ["$$comment.valid", true]},
        }
      }
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

  const pipeline = [match, sort, limit, commentsLookup, commentsFilter, votesLookup]

  const shares = await radiksData.aggregate(pipeline).toArray()

  return shares
}

module.exports = aggregateShares
