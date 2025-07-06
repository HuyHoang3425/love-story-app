const { Couple } = require('../socket/index')
const { User } = require('../models/index')
const { catchAsync, response, ApiError } = require('../utils')
const StatusCodes = require('http-status-codes')

const request = catchAsync(async (req, res) => {
  Couple.couple(req, res)
  const user = await User.findById(req.user.id).select('username acceptFriends requestFriends coupleId').populate({
    path: 'coupleId',
    select: 'userIdA userIdB'
  })
  let myLove = null;
  if (user.coupleId && user.coupleId.userIdA && user.coupleId.userIdB) {
    const yourUserId = user.id === user.coupleId.userIdA.toString() ? user.coupleId.userIdB : user.coupleId.userIdA
    myLove = await User.findById(yourUserId).select('username')
  }
  const acceptFriends = await User.find({
    _id: { $in: user.acceptFriends }
  }).select('_id username')

  const requestFriends = await User.find({
    _id: { $in: user.requestFriends }
  }).select('id username')

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy thông tin thành công.', {
      userId:user.id,
      myLove: myLove,
      acceptFriends: acceptFriends,
      requestFriends: requestFriends
    })
  )
})

module.exports = {
  request
}
