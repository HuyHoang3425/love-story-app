const { User } = require('../models')
const bcrypt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const { generate, jwt } = require('../utils')
const { SendMail } = require('../services')
const { env } = require('../config')

const register = catchAsync(async (req, res) => {
  const { username, email, password, repeatPassword } = req.body

  if (password !== repeatPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existingUser) {
    if (existingUser.email === email && existingUser.isVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã tồn tại.')
    }

    if (existingUser.username === username && existingUser.isVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Username đã tồn tại.')
    }
  }

  const otp = generate.generateNumber(4)
  const payload = {
    email,
    username,
    otp
  }
  const time = env.jwt.otp
  const tokenOtp = jwt.generateToken(payload, time)

  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }

  if (existingUser && !existingUser.isVerified) {
    await User.updateOne({ _id: existingUser.id }, { tokenOtp: tokenOtp })
  } else {
    await User.create({
      email,
      password,
      username,
      tokenOtp
    })
  }

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP thành công.', { email }))
})

const confirmOtp = catchAsync(async (req, res) => {
  const { otp, email, type } = req.body
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy user với email này.')
  }
  if (!user.tokenOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy OTP token.')
  }
  const checkExpire = jwt.isTokenExpired(user.tokenOtp)
  if (checkExpire) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP hết hạn.')
  }
  const payload = jwt.verifyToken(user.tokenOtp)
  if (payload.otp !== otp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập mã OTP sai.')
  }
  if (type === 'register' || !user.isVerified) {
    await User.updateOne(
      { email: user.email },
      {
        isVerified: true,
        tokenOtp: null
      }
    )
    res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xác thực tài khoản thành công.'))
  } else if (type === 'forgot-password' || user.isVerified) {
    await User.updateOne({ email: user.email }, { otpVerified: true })
    res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xác thực OTP thành công. Bạn có thể đổi mật khẩu.'))
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Loại xác thực không hợp lệ.')
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
  await User.updateOne(
    { _id: user.id },
    {
      tokenOtp: tokenOtp,
      otpVerified: false
    }
  )
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP đặt lại mật khẩu.', { email }))
})

const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, repeatNewPassword } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy người dùng.')
  }
  if (!user.otpVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng xác thực OTP trước khi đổi mật khẩu.')
  }
  if (!user.tokenOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy OTP token.')
  }
  const checkExpire = jwt.isTokenExpired(user.tokenOtp)
  if (checkExpire) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'OTP hết hạn. Vui lòng yêu cầu OTP mới.')
  }
  if (newPassword !== repeatNewPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Nhập lại mật khẩu không khớp.')
  }
  const isNewPasswordMatch = await bcrypt.compare(newPassword, user.password)
  if (isNewPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng không sử dụng mật khẩu trước đó.')
  }
  user.password = newPassword
  user.tokenOtp = null
  user.otpVerified = false
  await user.save()
  res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đặt lại mật khẩu thành công.'))
})

const profile = catchAsync(async (req, res) => {
  const { email } = req.user
  const user = await User.findOne({ email: email }).select('-password')
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'vui lòng đăng nhập.')
  }
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'lấy thông tin người dùng thành công.', user))
})

const editProfile = catchAsync(async (req, res) => {
  const email = req.user.email
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'vui lòng đăng nhập.')
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'vui lòng điền đầy đủ thông tin.')
  }
  delete req.body.email
  const userUpdate = await User.findByIdAndUpdate(user.id, req.body, {
    new: true,
    runValidators: true
  }).select('-password')
  res
    .status(StatusCodes.CREATED)
    .json(response(StatusCodes.OK, 'cập nhật thông tin người dùng thành công.', userUpdate))
})
module.exports = {
  register,
  confirmOtp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  profile,
  editProfile
}
