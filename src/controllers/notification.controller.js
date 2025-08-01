const { StatusCodes } = require('http-status-codes')

const { Notification } = require('../models')
const { catchAsync, ApiError, response } = require('../utils')

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

module.exports = {
  getNot
}
