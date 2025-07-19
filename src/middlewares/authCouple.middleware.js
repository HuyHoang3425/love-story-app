const { StatusCodes } = require('http-status-codes')

const { ApiError, catchAsync } = require('../utils')
const { completeDailyMission } = require('../services')

const authCouple = catchAsync(async (req, res, next) => {
  const user = req.user
  const coupleId = user.coupleId
  if (!coupleId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn chưa tham gia couple. Hãy kết nối với người ấy trước!')
  }
  const key = 'daily_login'
  await completeDailyMission(user.id, user.coupleId, dailyLogin, key)
  next()
})

module.exports = authCouple
