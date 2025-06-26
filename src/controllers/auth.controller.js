const { User, Auth } = require('../models');
const { findOne } = require('../models/user.model');
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const generateNumber = require('../utils/generate');
const sendMail = require('../utils/sendMail')

const register = catchAsync(async (req, res) => {
  const {username,email,password,repeatPassword} = req.body;
  const otp = generateNumber.generateNumber(4);

  const user = await User.findOne({email:email});
  if (user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại.')
  }
  if(password !== repeatPassword){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }
  const objectOtp = {
    username:username,
    email: email,
    otp: otp,
    password:password,
    expireAt: new Date()
  }
  await Auth.create(objectOtp)
  const subject = 'Mã xác nhận OTP'
  sendMail(email, subject, otp ,username)
})

const comfirmOtp = catchAsync( async (req,res) =>{
  const otp = req.body.otp;
  
  const confirm = await Auth.findOne({
    otp: otp
  })
  if(!confirm){
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  }
  const user = await User.create({
    username: confirm.username,
    email: confirm.email,
    password: confirm.password 
  })
  res.status(StatusCodes.CREATED).json(response(StatusCodes.CREATED, 'Đăng ký thành công.', user))
})

module.exports = {
  register,
  comfirmOtp,
}
