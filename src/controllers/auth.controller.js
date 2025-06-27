const { User, Auth } = require('../models')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const {generate} = require('../utils/index')
const {SendMail} = require('../services/index')

const register = catchAsync(async (req, res) => {
  const { username, email, password, repeatPassword } = req.body
  const otp = generate.generateNumber(4)

  const isEamil = await User.findOne({ email: email })
  if (isEamil) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại.')
  }
  const isUsername = await User.findOne({ username: username })
  if (isUsername) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Username đã tồn tại.')
  }
  if (password !== repeatPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }
  const objectOtp = {
    username: username,
    email: email,
    otp: otp,
    password: password,
    expireAt: new Date()
  }
  await Auth.create(objectOtp)
  const subject = 'Mã xác nhận OTP'
  SendMail.sendMail(email, subject, otp, username)
})

const comfirmOtp = catchAsync(async (req, res) => {
  const otp = req.body.otp

  const confirm = await Auth.findOne({
    otp: otp
  })
  if (!confirm) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  }
  const user = await User.create({
    username: confirm.username,
    email: confirm.email,
    password: confirm.password
  })
  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đăng ký thành công.', user))
})

const ok = (req,res) =>{
  res.send("oke");
}

module.exports = {
  register,
  comfirmOtp,
  ok,
}
