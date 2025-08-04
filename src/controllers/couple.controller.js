const { catchAsync, response, ApiError } = require('../utils')
const StatusCodes = require('http-status-codes')

const {
  User,
  Couple,
  Pet,
  CoupleMissionLog,
  UserMissionLog,
  DailyQuestion,
  RoomChat,
  FeedingLog,
  Notification
} = require('../models/index')
const socketCouple = require('../socket/handlers/couple.handle')
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
  if (!user?.coupleId) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bạn chưa kết nối với My Love!')
  }

  const couple = await Couple.findById(user.coupleId)
    .populate('userIdA', 'username avatar nickname gender dateOfBirth lastName firstName')
    .populate('userIdB', 'username avatar nickname gender dateOfBirth lastName firstName')

  if (!couple) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy Couple!')
  }

  const myLoveId = couple.userIdA._id.toString() === id.toString() ? couple.userIdB._id : couple.userIdA._id

  const myLove = await User.findById(myLoveId).select('public_key')

  const coupleData = couple.toObject()
  coupleData.public_key_my_love = myLove?.public_key || null
  coupleData.private_key_user = user.private_key || null

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy thông tin Couple thành công.', {
      couple: coupleData
    })
  )
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

  if (couple.loveStartedAtEdited) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'chỉ được sửa ngày yêu 1 lần!')
  }

  couple.loveStartedAt = new Date(loveStartedAt)
  couple.loveStartedAtEdited = true
  await couple.save()

  //socketIO
  const io = socket.getIO()
  const currentUserId = user.id.toString()
  const coupleUserA = couple.userIdA._id.toString()
  const coupleUserB = couple.userIdB._id.toString()

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

  await RoomChat.deleteOne({ coupleId: userA.coupleId })

  userA.coupleId = undefined
  userB.coupleId = undefined
  await Promise.all([
    userA.save(),
    userB.save(),
    Pet.deleteOne({ coupleId: couple.id }),
    CoupleMissionLog.deleteMany({ coupleId: couple._id }),
    UserMissionLog.deleteMany({ coupleId: couple._id }),
    DailyQuestion.deleteMany({ coupleId: couple._id }),
    Couple.deleteOne({ _id: couple.id }),
    Notification.deleteMany({ coupleId: couple._id }),
    FeedingLog.deleteMany({ coupleId: couple._id })
  ])

  res.status(StatusCodes.OK).json(response(StatusCodes.CREATED, 'Huỷ kết nối thành công.'))
})

module.exports = {
  connect,
  disconnect,
  getInfoCouple,
  editLoveStarted
}
