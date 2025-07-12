// models/mission.model.js
const mongoose = require('mongoose')

const missionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true
    },
    coin: {
      type: Number,
      default: 0
    },
    isShared: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Mission', missionSchema)
