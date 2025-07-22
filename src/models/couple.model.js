const mongoose = require('mongoose')
const Pet = require('./pet.model')

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
    },
    loveStartedAtEdited: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)
coupleSchema.post('save', async function () {
  const existedPet = await Pet.findOne({ coupleId: this.id })
  if (!existedPet) {
    await Pet.create({ coupleId: this.id })
  }
})

module.exports = mongoose.model('Couple', coupleSchema)
