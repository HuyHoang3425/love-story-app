const { User } = require('../models')
const bcrypt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const { generate, jwt } = require('../utils')
const { SendMail } = require('../services')
const { env } = require('../config')
const { verifyToken } = require('../utils/jwt')

const register = catchAsync(async (req, res) => {
  const { username, email, password, repeatPassword } = req.body

  if (password !== repeatPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existingUser) {
    if (existingUser.email === email && existingUser.isVerifiedToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại.')
    }

    if (existingUser.username === username && existingUser.isVerifiedToken) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Username đã tồn tại.')
    }
  }

  const otp = generate.generateNumber(4)
  const payload = {
    email,
    password,
    username,
    otp,
    isVerifiedToken: false
  }
  const time = env.jwt.otp
  const tokenOtp = jwt.generateToken(payload, time)
  payload.tokenOtp = tokenOtp

  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }

  if (existingUser && !existingUser.isVerifiedToken) {
    await User.updateOne({ _id: existingUser.id }, payload)
  } else {
    await User.create(payload)
  }

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP thành công.', { email }))
})

const confirmOtpRegister = catchAsync(async (req, res) => {
  const { email, otp } = req.body

  const user = await User.findOne({ email: email })

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy user với email này.')
  }

  if (!user.tokenOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy OTP token.')
  }

  const checkExpire = jwt.isTokenExpired(user.tokenOtp)
  if (checkExpire) {
    await User.deleteOne({ email: user.email })
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP hết hạn.')
  }

  const payload = jwt.verifyToken(user.tokenOtp)
  if (payload.otp !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  } else {
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { isVerifiedToken: true, tokenOtp: '' },
      { new: true }
    )

    res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đăng ký thành công.', updatedUser))
  }
})

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email })

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc Password không chính xác.')
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc Password không chính xác.')
  }
  const time = env.jwt.login
  const token = jwt.generateToken(req.body, time)
  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đăng nhập thành công.', token))
})

const changePassword = catchAsync(async (req, res) => {
  const { password, newPassword, repeatNewPassword } = req.body
  const id = req.user.id
  const user = await User.findById(id)
  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mật khẩu không chính xác.')
  }
  if (newPassword !== repeatNewPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }
  const isNewPasswordMatch = await bcrypt.compare(newPassword, user.password)
  if (isNewPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng không sử dụng mật khẩu trước đó.')
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'cập nhật mật khẩu thành công.'))
})

const forgotPassword = catchAsync(async (req, res) => {
  const email = req.body.email
  const otp = generate.generateNumber(4)
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email chưa được đăng ký tài khoản.')
  }
  const time = env.jwt.otp
  const tokenOtp = jwt.generateToken({ email: user.email, otp: otp }, time)
  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, user.username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }
  await User.updateOne({ _id: user.id }, { tokenOtp: tokenOtp })

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP thành công.', { email }))
})

const confirmOtpForgotPassword = catchAsync(async (req, res) => {
  const { email, otp } = req.body
  const user = await User.findOne({ email: email })

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy user với email này.')
  }

  if (!user.tokenOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy OTP token.')
  }

  const checkExpire = jwt.isTokenExpired(user.tokenOtp)
  if (checkExpire) {
    await User.updateOne({ tokenOtp: '' })
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP hết hạn.')
  }

  const payload = jwt.verifyToken(user.tokenOtp)
  console.log(payload.otp)
  if (payload.otp != otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  } else {
    const time = env.jwt.login
    const token = jwt.generateToken({ email: user.email, password: user.password }, time)
    res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Nhập OTP đúng.', token))
  }
})

const resetPassword = catchAsync(async (req, res) => {
  const { newPassword, repeatNewPassword} = req.body
  const token = jwt.extractToken(req)
  const payload = jwt.verifyToken(token)
  const user = await User.findOne({email:payload.email})
  if (newPassword !== repeatNewPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }
  const isNewPasswordMatch = await bcrypt.compare(newPassword, user.password)
  if (isNewPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng không sử dụng mật khẩu trước đó.')
  }
  user.password = newPassword
  await user.save()
  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'cập nhật mật khẩu thành công.'))
})
module.exports = {
  register,
  confirmOtpRegister,
  login,
  changePassword,
  forgotPassword,
  confirmOtpForgotPassword,
  resetPassword
}
