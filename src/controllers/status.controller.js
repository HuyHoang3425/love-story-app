const StatusCodes = require('http-status-codes')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { time } = require('../config/env.config')
const { getIO } = require('../socket/index')
const sendNot = require('../socket/handlers/notification.handle')
const { DailyStatus } = require('../models')
const { catchAsync, response } = require('../utils')

dayjs.extend(utc)
dayjs.extend(timezone)

const getDailyStatus = catchAsync(async (req, res) => {
  const user = req.user
  const startOfToday = dayjs().tz(time.vn_tz).startOf('day').toDate()
  const endOfToday = dayjs().tz(time.vn_tz).endOf('day').toDate()

  let dailyStatus = await DailyStatus.findOne({
    coupleId: user.coupleId,
    date: { $gte: startOfToday, $lte: endOfToday }
  }).populate('statusId')

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy Status hôm nay thành công.', {
      status: dailyStatus
    })
  )
})

module.exports = {
  getDailyStatus
}
