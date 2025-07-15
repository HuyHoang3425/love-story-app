// models/userMissionLog.model.js
const mongoose = require('mongoose')

const userMissionLogSchema = new mongoose.Schema(
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
    answerUserA: String,
    answerUserB: String,
    userAAnsweredAt: Date,
    userBAnsweredAt: Date
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('UserMissionLog', userMissionLogSchema)
