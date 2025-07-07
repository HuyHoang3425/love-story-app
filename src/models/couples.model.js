const mongoose = require('mongoose')

const coupleSchema = new mongoose.Schema(
  {
    userIdA: String,
    userIdB: String,
    coin: Number,
    loveStartedAt: Date
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Couples', coupleSchema)
