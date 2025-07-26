// models/coupleMissionLog.model.js
const mongoose = require('mongoose')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const coupleMissionLogSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    missionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mission',
      required: true
    },
    date: Date,
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

coupleMissionLogSchema.pre('save', function (next) {
  if (this.date) {
    this.date = dayjs(this.date).tz(time.vn_tz).utc().toDate()
  }
  next()
})

module.exports = mongoose.model('CoupleMissionLog', coupleMissionLogSchema)
