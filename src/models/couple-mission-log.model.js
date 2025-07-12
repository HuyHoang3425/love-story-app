// models/coupleMissionLog.model.js
const mongoose = require('mongoose')

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
    date:Date,
    userACompleted: {
      type: Boolean,
      default: false
    },
    userBCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('CoupleMissionLog', coupleMissionLogSchema)
