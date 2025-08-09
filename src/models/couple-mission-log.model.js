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
    date: Date,
    countCompleted: {
      type: Number,
      default: 0,
      max:2,
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

module.exports = mongoose.model('CoupleMissionLog', coupleMissionLogSchema)
