const mongoose = require('mongoose')

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      default: 'example.png'
    },
    price: {
      type: Number,
      required: true
    },
    nutritionValue: {
      type: Number,
      required: true
    },
    happinessValue: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Food', foodSchema)
