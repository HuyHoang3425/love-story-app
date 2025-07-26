// models/Room.js
const mongoose = require('mongoose')
const { Schema } = mongoose

const roomChatSchema = new Schema({
  coupleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Couple',
    required: true,
    unique: true
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('RoomChat', roomChatSchema)
