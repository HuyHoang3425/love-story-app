const { catchAsync, response, ApiError } = require('../utils')
const StatusCodes = require('http-status-codes')

const { User, Couple, Pet } = require('../models/index')
const socketCouple  = require('../socket/handlers/couple.handle')
const socket = require('../socket')

const connect = catchAsync(async (req, res) => {
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

  if (!user.coupleId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bạn chưa kết nối với My Love!')
  }

  const couple = await Couple.findById(user.coupleId)
    .populate('userIdA', 'username avatar')
    .populate('userIdB', 'username avatar')
  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }

  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Lấy thông tin Couple thành công.', { couple }))
})

const editLoveStarted = catchAsync(async (req, res) => {
  const id = req.user.id
  const { loveStartedAt } = req.body

  const user = await User.findById(id).select('coupleId')

  const couple = await Couple.findById(user.coupleId)
    .populate('userIdA', 'username avatar')
    .populate('userIdB', 'username avatar')
  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }

  if (couple.loveStartedAtEdited) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'chỉ được sửa ngày yêu 1 lần!')
  }

  couple.loveStartedAt = new Date(loveStartedAt)
  couple.loveStartedAtEdited = true
  await couple.save()
  
  //socketIO
  const io = socket.getIO()
  const currentUserId = user.id.toString()
  const coupleUserA = couple.userIdA.toString()
  const coupleUserB = couple.userIdB.toString()

  // Xác định người còn lại
  const myLoveId = currentUserId === coupleUserA ? coupleUserB : coupleUserA
  
  // Gửi socket thông báo
  socketCouple.loveStarted(io, myLoveId)


  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Cập nhật ngày yêu của Couple thành công.', { couple }))
})

const disconnect = catchAsync(async (req, res) => {
  const id = req.user.id
  const userA = await User.findById(id).select('coupleId coupleCode')
  if (!userA.coupleId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bạn chưa kết nối với My Love!')
  }

  const couple = await Couple.findById(userA.coupleId)
  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }

  const userB = await User.findById(couple.userIdA.toString() === id ? couple.userIdB : couple.userIdA)

  userA.coupleId = undefined
  userB.coupleId = undefined
  await userA.save()
  await userB.save()

  await Pet.deleteOne({ coupleId: couple.id })
  await Couple.deleteOne({ _id: couple.id })

  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Huỷ kết nối thành công.'))
})

module.exports = {
  connect,
  disconnect,
  getInfoCouple,
  editLoveStarted
}
