const cron = require('node-cron')
const { Mission, CoupleMissionLog, Couple } = require('../models')

const generateDailyMissionsTomorrow = async () => {
  const [missions, couples] = await Promise.all([Mission.find({ isActive: true }), Couple.find({})])

  const bulk = []

  // Ngày mai
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  for (const couple of couples) {
    // Kiểm tra nếu đã có nhiệm vụ cho ngày mai
    const exists = await CoupleMissionLog.exists({
      coupleId: couple._id,
      date: tomorrow
    })

    if (!exists) {
      for (const mission of missions) {
        bulk.push({
          coupleId: couple._id,
          missionId: mission._id,
          date: tomorrow
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await CoupleMissionLog.deleteMany({
    date: { $lt: today },
    isCompleted: false
  })
}

module.exports = {
  generateDailyMissionsTomorrow,
  deleteUncompletedMissions
}
