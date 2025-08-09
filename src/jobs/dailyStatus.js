const { Couple, DailyStatus, Status } = require('../models')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const generateDailyStatusTomorrow = async () => {
  const now = dayjs().tz(time.vn_tz)
  const startOfTomorrow = now.add(1, 'day').startOf('day').utc(true).toDate()

  const couples = await Couple.find({})

  for (const couple of couples) {
    try {
      const exists = await DailyStatus.exists({
        coupleId: couple._id,
        date: startOfTomorrow
      })

      if (exists) continue

      const usedStatusIds = await DailyStatus.find({ coupleId: couple._id }).distinct('statusId')

      const unusedStatus = await Status.find({ _id: { $nin: usedStatusIds } })

      if (unusedStatus.length === 0) continue

      const randomStatus = unusedStatus[Math.floor(Math.random() * unusedStatus.length)]

      await DailyStatus.create({
        coupleId: couple._id,
        statusId: randomStatus._id,
        date: startOfTomorrow
      })

      console.log(`✅ Tạo status cho couple ${couple._id} ngày mai`)
    } catch (err) {
      console.error(`❌ Lỗi khi tạo status cho couple ${couple._id}:`, err)
    }
  }
}

module.exports = { generateDailyStatusTomorrow }
