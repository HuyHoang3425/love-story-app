const mongoose = require('mongoose')

const feedingLogSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true
    },
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      required: true
    },
    fedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    fedAt: {
      type: Date,
      default: Date.now
    },
    value: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('FeedingLog', feedingLogSchema)
