const { catchAsync, response, ApiError } = require('../utils')
const StatusCodes = require('http-status-codes')

const { User, Couple } = require('../models/index')

const request = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).select('username acceptFriends requestFriends coupleId').populate({
    path: 'coupleId',
    select: 'userIdA userIdB'
  })
  let myLove = null
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
      userId: user.id,
      myLove: myLove,
      acceptFriends: acceptFriends,
      requestFriends: requestFriends
    })
  )
})

const getInfoCouple = catchAsync(async (req, res) => {
  const id = req.user.id
  const user = await User.findById(id).select('coupleId')
  const couple = await Couple.findById(user.coupleId)
  if (!user.coupleId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bạn chưa kết nối với My Love!')
  }

  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }

  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Lấy thông tin Couple thành công.', { couple }))
})

const editInfoCouple = catchAsync(async (req, res) => {
  const id = req.user.id
  const user = await User.findById(id).select('coupleId')

  const couple = await Couple.findById(user.coupleId)
  if (!user.coupleId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bạn chưa kết nối với My Love!')
  }

  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }
  
  Object.assign(couple, req.body)
  await couple.save()
  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Cập nhật thông tin Couple thành công.', { couple }))
})

module.exports = {
  request,
  getInfoCouple,
  editInfoCouple
}
