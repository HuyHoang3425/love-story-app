const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const env = require('../config/env.config')


const { UserConstants } = require('../constants')
const generateNumber = require('../utils/generate');

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

userSchema.pre('save',async function(next){
  if(this.isModified('password')){
    const saltRounds = env.bcrypt.saltRounds;;
    this.password = await bcrypt.hash(this.password,saltRounds);
  }
  if (!this.coupleCode) {
    let isUnique = false;
    while (!isUnique) {
      this.coupleCode = generateNumber.generateNumber(6);
      const user = await this.constructor.findOne({ coupleCode: this.coupleCode });
      if (!user) isUnique = true;
    }
  }
  next();
})

module.exports = mongoose.model('User', userSchema)
