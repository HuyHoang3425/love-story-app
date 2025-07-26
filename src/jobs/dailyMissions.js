const { Mission, CoupleMissionLog, Couple } = require('../models')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const generateDailyMissionsTomorrow = async () => {
  const [missions, couples] = await Promise.all([Mission.find({ isActive: true }), Couple.find({})])

  const bulk = []

  // Ngày mai
  const now = dayjs().tz(time.vn_tz)
  const startOfTomorrow = now.add(1, 'day').startOf('day')

  for (const couple of couples) {
    // Kiểm tra nếu đã có nhiệm vụ cho ngày mai
    const exists = await CoupleMissionLog.exists({
      coupleId: couple._id,
      date: startOfTomorrow
    })

    if (!exists) {
      for (const mission of missions) {
        bulk.push({
          coupleId: couple._id,
          missionId: mission._id,
          date: startOfTomorrow
        })
      }
    }
  }

  if (bulk.length > 0) {
    await CoupleMissionLog.insertMany(bulk, { ordered: false })
    console.log(`[CRON] ✅ Đã tạo ${bulk.length} nhiệm vụ cho ngày mai.`)
  }
}

const deleteUncompletedMissions = async () => {
  const now = dayjs().tz(time.vn_tz).startOf('day').toDate()

  await CoupleMissionLog.deleteMany({
    date: { $lt: now },
    isCompleted: false
  })
}

module.exports = {
  generateDailyMissionsTomorrow,
  deleteUncompletedMissions
}
