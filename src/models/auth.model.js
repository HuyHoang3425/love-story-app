const mongoose = require("mongoose");
const authSchema = new mongoose.Schema(
  {
    username:String,
    email: String,
    otp: String,
    password:String,
    expireAt:{
      type:Date,
      expires:120,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auth', authSchema)
