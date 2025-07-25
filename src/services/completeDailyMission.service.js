const { StatusCodes } = require('http-status-codes')
const ApiError = require('../utils/ApiError')
const { CoupleMissionLog, Couple, UserMissionLog, Mission } = require('../models')

const completeDailyMission = async (userId, coupleId, key) => {
  const mission = await Mission.findOne({ key: key })
  if (!mission) throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy nhiệm vụ.')

  const couple = await Couple.findById(coupleId)
  const isUserA = String(userId) === String(couple.userIdA)
  const isUserB = String(userId) === String(couple.userIdB)

  const today = new Date().toISOString().slice(0, 10)

  const coupleMission = await CoupleMissionLog.findOne({
    coupleId,
    missionId: mission.id
  })

  if (!coupleMission) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'không tìm thấy nhiệm vụ.')
  }

  if (coupleMission.isCompleted) {
    return
  }

  let log = await UserMissionLog.findOne({
    coupleId,
    missionId: mission.id,
    date: today
  })
  if (mission.type === 'private') {
    if (!log) {
      const newLogData = {
        coupleId,
        missionId: mission.id,
        date: today
      }

      if (isUserA) {
        newLogData.userIdACompleted = userId
        newLogData.userACompletedAt = new Date()
      } else if (isUserB) {
        newLogData.userIdBCompleted = userId
        newLogData.userBCompletedAt = new Date()
      }

      await UserMissionLog.create(newLogData)

      coupleMission.isCompleted = true
      couple.coin += mission.coin
      await Promise.all([couple.save(), coupleMission.save()])
    }
  } else if (mission.type === 'shared') {
    if (!log) {
      log = await UserMissionLog.create({
        coupleId,
        missionId: mission.id,
        date: today
      })
    }

    if (isUserA && !log.userIdACompleted) {
      log.userIdACompleted = userId
      log.userACompletedAt = new Date()
    } else if (isUserB && !log.userIdBCompleted) {
      log.userIdBCompleted = userId
      log.userBCompletedAt = new Date()
    }

    await log.save()

    if (log.userIdACompleted && log.userIdBCompleted) {
      coupleMission.isCompleted = true
      couple.coin += mission.coin
      await Promise.all([couple.save(), coupleMission.save()])
    }
  }
}

module.exports = completeDailyMission
