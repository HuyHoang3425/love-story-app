const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { NotificationConstants } = require('../constants')

const notificationSchema = new Schema(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: NotificationConstants.NOTIFICATION,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Notification', notificationSchema)
