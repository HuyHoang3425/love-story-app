const mongoose = require('mongoose')

const coupleSchema = new mongoose.Schema(
  {
    userIdA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userIdB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coin: {
      type: Number,
      default: 0
    },
    loveStartedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Couple', coupleSchema)
