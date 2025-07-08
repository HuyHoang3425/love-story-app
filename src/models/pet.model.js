const mongoose = require('mongoose')

const petSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    name: {
      type: String,
      required: true,
      default: 'Pet tình yêu'
    },
    hunger: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    happiness: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    lastFedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true 
  }
)

module.exports = mongoose.model('Pet', petSchema)
