const { User, Auth } = require('../models')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const { generate } = require('../utils/index')
const sendMail = require('../services/sendMail.sevice')

const register = catchAsync(async (req, res) => {
  const { username, email, password, repeatPassword } = req.body
  const otp = generate.generateNumber(4)

  const isEmail = await User.findOne({ email })
  if (isEmail) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại.')
  }

  const isUsername = await User.findOne({ username })
  if (isUsername) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Username đã tồn tại.')
  }

  if (password !== repeatPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }

  const subject = 'Mã xác nhận OTP'
  const sent = await sendMail(email, subject, otp, username)
  if (sent) {
    await Auth.deleteMany({ email })
    const objectOtp = {
      username,
      email,
      otp,
      password,
      expireAt: new Date()
    }
    await Auth.create(objectOtp)
    res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP thành công.'))
  } else {
    res.status(StatusCodes.BAD_REQUEST).json(response(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.'))
  }
})

const comfirmOtp = catchAsync(async (req, res) => {
  const { otp } = req.body


  const confirm = await Auth.findOne({ otp })
  if (!confirm) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  }

  const isEmailExists = await User.findOne({ email: confirm.email })
  if (isEmailExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã được xác nhận trước đó.')
  }


  const user = await User.create({
    username: confirm.username,
    email: confirm.email,
    password: confirm.password
  })

  
  await Auth.deleteMany({ email: confirm.email })


  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đăng ký thành công.', user))
})



module.exports = {
  register,
  comfirmOtp,
}
