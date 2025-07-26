// models/dailyQuestion.model.js
const mongoose = require('mongoose')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const dailyQuestionSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    answerUserA: {
      type: String
    },
    answerUserB: {
      type: String
    },
    userAAnsweredAt: {
      type: Date
    },
    userBAnsweredAt: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

dailyQuestionSchema.pre('save', function (next) {
  if (this.date) {
    this.date = dayjs(this.date).tz(time.vn_tz).utc().toDate()
  }
  next()
})

module.exports = mongoose.model('DailyQuestion', dailyQuestionSchema)
