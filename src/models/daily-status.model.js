const mongoose = require('mongoose')

const dailyStatusSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Status',
      required: true
    },
    date: Date
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('DailyStatus', dailyStatusSchema)
