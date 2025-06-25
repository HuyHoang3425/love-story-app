const mongoose = require('mongoose')
const { UserConstants } = require('../constants')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    nickname: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: UserConstants.GENDER,
      default: UserConstants.GENDER.OTHER
    },
    dateOfBirth: {
      type: Date
    },
    avatar: {
      type: String,
      default: '/example.png'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // TODO: generate couple code when user is created
    coupleCode: {
      type: String,
      unique: true
    },
    role: {
      type: String,
      enum: UserConstants.ROLE,
      default: UserConstants.ROLE.USER
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', userSchema)
