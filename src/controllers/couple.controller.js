const { Couple } = require('../socket/index')
const { User } = require('../models/index')
const { catchAsync , response } = require('../utils')
const StatusCodes = require('http-status-codes')

const request = catchAsync(async (req, res) => {
  Couple.couple(req, res)
  const user = await User.findOne({ _id: req.user.id })
  const acceptFriends = await User.find({
    _id: { $in: user.acceptFriends }
  }).select('_id username')

  const requestFriends = await User.find({
    _id: { $in: user.requestFriends }
  }).select('id username')

  // res.render('index', {
  //   userId: user.id,
  //   acceptFriends: acceptFriends,
  //   requestFriends: requestFriends
  // })
  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy thông tin thành công.', {
      userId: user.id,
      acceptFriends: acceptFriends,
      requestFriends: requestFriends
    })
  )
})

module.exports = {
  request
}
