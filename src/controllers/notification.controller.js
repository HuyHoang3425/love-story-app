const { StatusCodes } = require('http-status-codes')

const { Notification, User } = require('../models')
const { catchAsync, ApiError, response } = require('../utils')
const { sendNotificationToToken } = require('../services/firebase.service')

const getNot = catchAsync(async (req, res) => {
  const user = req.user

  const { limit = 10, page = 1 } = req.query
  const skip = (+page - 1) * +limit

  const [nots, totalNots] = await Promise.all([
    Notification.find({ coupleId: user.coupleId }).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Notification.countDocuments({ coupleId: user.coupleId })
  ])

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy thông báo thành công.', {
      nots: nots,
      totalNots,
      totalPages: Math.ceil(totalNots / +limit),
      currentPage: +page
    })
  )
})

// const sendNot = catchAsync(async (req, res) => {
//   const { token, title, body } = req.body
//   await sendNotificationToToken(token, title, body)
//   res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi thông báo thành công!'))
// })

// const saveFcmToken = catchAsync(async (req, res) => {
//   const { userId, fcmToken } = req.body
//   await User.findByIdAndUpdate(userId, { fcmToken })
//   res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Lưu thành thành công!'))
// })

module.exports = {
  getNot
  // sendNot,
  // saveFcmToken
}
