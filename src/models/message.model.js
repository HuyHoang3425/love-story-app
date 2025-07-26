// models/Message.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  roomChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoomChat',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  images: Array,
  sentAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model("Message", messageSchema);
