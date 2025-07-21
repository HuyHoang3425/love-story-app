const cron = require('node-cron')
const { Mission, CoupleMissionLog, Couple } = require('../models')

let isStarted = false

const generateDailyMissions = async () => {
  if (isStarted) return
  isStarted = true

  cron.schedule(
    '0 23 * * *',
    async () => {
      const [missions, couples] = await Promise.all([Mission.find({ isActive: true }), Couple.find({})])

      const bulk = []

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      for (const couple of couples) {
        for (const mission of missions) {
          bulk.push({
            coupleId: couple._id,
            missionId: mission._id,
            dateAssigned: new Date(tomorrow)
          })
        }
      }

      if (bulk.length > 0) {
        await CoupleMissionLog.insertMany(bulk, { ordered: false })
      }
    },
    {
      timezone: 'Asia/Ho_Chi_Minh'
    }
  )
}

const deleteYesterdayMissions = async () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const endOfYesterday = new Date(yesterday)
  endOfYesterday.setHours(23, 59, 59, 999)

  await CoupleMissionLog.deleteMany({
    dateAssigned: { $gte: yesterday, $lte: endOfYesterday }
  })
}

module.exports = {
  generateDailyMissions,
  deleteYesterdayMissions
}
