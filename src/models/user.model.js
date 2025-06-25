const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    nickname: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dob: Date,
    avatar: String,
    coin: {
      type: Number,
      default: 0,
    },
    coupleCode: {
      type: String,
    },
    // coupleId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Couple',
    // },
    deleted:{
      type:Boolean,
      default:false,
    },
    status: {
      type: String,
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema,"users");

module.exports = User;
