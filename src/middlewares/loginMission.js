const { StatusCodes } = require('http-status-codes')
const { Mission } = require('../models')
const { completeDailyMission } = require('../services')
const { catchAsync, ApiError } = require('../utils')

const loginMission = catchAsync(async (req, res, next) => {
  const user = req.user
  const dailyLogin = await Mission.findOne({ key: 'daily_login' })
  if (!dailyLogin) throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy nhiệm vụ.')
  completeDailyMission(user.id, user.coupleId, dailyLogin)
  return next()
})

module.exports = loginMission
