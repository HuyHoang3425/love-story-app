const mongoose = require('mongoose')

const { MissionConstants } = require('../constants')

const missionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    coin: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      enum: MissionConstants.TYPE,
      require: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Mission', missionSchema)
