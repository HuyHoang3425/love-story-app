const { StatusCodes } = require('http-status-codes')
const { UserMissionLog, Mission, Couple, CoupleMissionLog } = require('../models')
const { catchAsync, ApiError } = require('../utils')

const loginMission = catchAsync(async (req, res, next) => {
  const user = req.user
  const couple = await Couple.findById(user.coupleId)

  const dailyLogin = await Mission.findOne({ key: 'daily_login' })
  if (!dailyLogin) throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy nhiệm vụ.')

  const today = new Date().toISOString().slice(0, 10)

  const coupleMission = await CoupleMissionLog.findOne({
    coupleId: user.coupleId,
    missionId: dailyLogin.id
  })
  if (!coupleMission) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhiệm vụ hôm nay chưa được tạo cho cặp đôi.')
  }

  if (coupleMission.isCompleted === true) {
    return next()
  }
  let log = await UserMissionLog.findOne({
    coupleId: user.coupleId,
    missionId: dailyLogin.id,
    date: today
  })

  const isUserA = String(user._id) === String(couple.userIdA)
  const isUserB = String(user._id) === String(couple.userIdB)

  if (!log) {
    const newLogData = {
      coupleId: user.coupleId,
      missionId: dailyLogin.id,
      date: today
    }

    if (isUserA) {
      newLogData.userIdACompleted = user._id
      newLogData.userACompletedAt = new Date()
    } else if (isUserB) {
      newLogData.userIdBCompleted = user._id
      newLogData.userBCompletedAt = new Date()
    }

    log = await UserMissionLog.create(newLogData)

    if (dailyLogin.type === 'private') {
      coupleMission.isCompleted = true
      await coupleMission.save()
    }
    return next()
  }

  if (dailyLogin.type === 'shared') {
    if (!log.userIdACompleted && isUserA) {
      log.userIdACompleted = user._id
      log.userACompletedAt = new Date()
      await log.save()
    } else if (!log.userIdBCompleted && isUserB) {
      log.userIdBCompleted = user._id
      log.userBCompletedAt = new Date()
      await log.save()
    }

    if (log.userIdACompleted && log.userIdBCompleted) {
      coupleMission.isCompleted = true
      await coupleMission.save()
    }
  }

  return next()
})

module.exports = loginMission
