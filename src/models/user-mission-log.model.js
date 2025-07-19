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
    userIdACompleted: String,
    userIdBCompleted: String,
    userACompletedAt: Date,
    userBCompletedAt: Date
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('UserMissionLog', userMissionLogSchema)
