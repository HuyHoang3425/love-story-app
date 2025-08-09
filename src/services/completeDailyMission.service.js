const { StatusCodes } = require('http-status-codes')

const ApiError = require('../utils/ApiError')
const { completedMission } = require('../socket/handlers/completedMission')
const { CoupleMissionLog, Couple, UserMissionLog, Mission } = require('../models')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const completeDailyMission = async (userId, coupleId, key) => {
  console.log('LỖI:', userId, coupleId, key)
  const { getIO } = require('../socket')
  const io = getIO()
  const mission = await Mission.findOne({ key: key })
  if (!mission) throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy nhiệm vụ.')

  const couple = await Couple.findById(coupleId)
  const isUserA = String(userId) === String(couple.userIdA)
  const isUserB = String(userId) === String(couple.userIdB)

  const startOfToday = dayjs().tz(time.vn_tz).startOf('day').toDate()
  const endOfToday = dayjs().tz(time.vn_tz).endOf('day').toDate()

  const coupleMission = await CoupleMissionLog.findOne({
    coupleId,
    missionId: mission.id,
    date: { $gte: startOfToday, $lte: endOfToday }
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
    date: { $gte: startOfToday, $lte: endOfToday }
  })
  if (mission.type === 'private') {
    if (!log) {
      const newLogData = {
        coupleId,
        missionId: mission.id,
        date: dayjs().tz(time.vn_tz).toDate()
      }

      if (isUserA) {
        newLogData.userIdACompleted = userId
        newLogData.userACompletedAt = dayjs().tz(time.vn_tz).toDate()
      } else if (isUserB) {
        newLogData.userIdBCompleted = userId
        newLogData.userBCompletedAt = dayjs().tz(time.vn_tz).toDate()
      }

      await UserMissionLog.create(newLogData)

      coupleMission.isCompleted = true
      coupleMission.countCompleted += 1
      couple.coin += mission.coin
      const data = {
        coin: couple.coin
      }
      completedMission(io, couple.userIdA.toString(), couple.userIdB.toString(), data)
      await Promise.all([couple.save(), coupleMission.save()])
    }
  } else if (mission.type === 'shared') {
    if (!log) {
      log = await UserMissionLog.create({
        coupleId,
        missionId: mission.id,
        date: dayjs().tz(time.vn_tz).toDate()
      })
    }

    if (isUserA && !log.userIdACompleted) {
      log.userIdACompleted = userId
      log.userACompletedAt = dayjs().tz(time.vn_tz).toDate()
    } else if (isUserB && !log.userIdBCompleted) {
      log.userIdBCompleted = userId
      log.userBCompletedAt = dayjs().tz(time.vn_tz).toDate()
    }

    coupleMission.countCompleted += 1
    await Promise.all([log.save(), coupleMission.save()])

    if (log.userIdACompleted && log.userIdBCompleted) {
      coupleMission.isCompleted = true
      couple.coin += mission.coin
      const data = {
        coin: couple.coin
      }
      completedMission(io, couple.userIdA.toString(), couple.userIdB.toString(), data)
      await Promise.all([couple.save(), coupleMission.save()])
    }
  }
}

module.exports = completeDailyMission
