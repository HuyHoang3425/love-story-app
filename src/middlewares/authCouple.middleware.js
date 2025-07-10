const { StatusCodes } = require('http-status-codes')

const { ApiError, catchAsync } = require('../utils')

const authCouple = catchAsync(async (req, res, next) => {
  const coupleId = req.user.coupleId
  if (!coupleId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn chưa tham gia couple. Hãy kết nối với người ấy trước!')
  }

  next()
})

module.exports = authCouple
