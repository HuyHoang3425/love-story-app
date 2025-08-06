const { User, RoomChat } = require('../models')
const bcrypt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const { generate, jwt } = require('../utils')
const { SendMail } = require('../services')
const { env } = require('../config')

const register = catchAsync(async (req, res) => {
  const { username, email, password, repeatPassword } = req.body

  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (existingUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'tài khoản đã tồn tại.')
  }

  const user = await User.create({ username, password, email })
  const otp = generate.generateNumber(4)
  const payload = {
    email,
    otp
  }
  const time = env.jwt.otp
  const secret_otp = env.jwt.secret_otp
  const tokenOtp = jwt.generateToken(payload, secret_otp, time)
  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }
  user.tokenOtp = tokenOtp
  await user.save()
  res
    .status(StatusCodes.CREATED)
    .json(
      response(StatusCodes.CREATED, 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.', { email })
    )
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
  const secretOTp = env.jwt.secret_otp
  const payload = jwt.verifyToken(user.tokenOtp, secretOTp)
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
    const time = env.jwt.login
    const secret_login = env.jwt.secret_login
    const token = jwt.generateToken({ id: user.id }, secret_login, time)
    res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xác thực tài khoản thành công.', token))
  } else if (type === 'forgot-password') {
    const time = env.jwt.otp
    const secret_otp = env.jwt.secret_otp
    const token = jwt.generateToken({ email: user.email }, secret_otp, time)

    res
      .status(StatusCodes.OK)
      .json(response(StatusCodes.OK, 'Xác thực OTP thành công. Bạn có thể đổi mật khẩu.', { token: token }))
  } else {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Loại xác thực không hợp lệ.')
  }
})

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email }).select('+password')
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc Password không chính xác.')
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password)
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc Password không chính xác.')
  }

  if (!user.isVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tài khoản chưa được xác nhận.')
  }

  const time = env.jwt.login
  const secret_login = env.jwt.secret_login
  const token = jwt.generateToken({ id: user.id }, secret_login, time)
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đăng nhập thành công.', token))
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
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'cập nhật mật khẩu thành công.'))
})

const forgotPassword = catchAsync(async (req, res) => {
  const email = req.body.email
  const otp = generate.generateNumber(4)
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email chưa được đăng ký tài khoản.')
  }
  const time = env.jwt.otp
  const secret_otp = env.jwt.secret_otp
  const tokenOtp = jwt.generateToken({ email: user.email, otp: otp }, secret_otp, time)
  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, user.username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }
  await User.updateOne(
    { _id: user.id },
    {
      tokenOtp: tokenOtp
    }
  )
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đã gửi OTP đặt lại mật khẩu.', { email }))
})

const resetPassword = catchAsync(async (req, res) => {
  const { email, newPassword, repeatNewPassword, token } = req.body
  const checkExpire = jwt.isTokenExpired(token)
  if (checkExpire) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token hết hạn.')
  }

  const secret_otp = env.jwt.secret_otp
  const payload = jwt.verifyToken(token, secret_otp)

  if (payload.email !== email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token không hợp lệ cho email này.')
  }

  const user = await User.findOne({ email }).select(" +password ")
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không tìm thấy người dùng.')
  }

  const isNewPasswordMatch = await bcrypt.compare(newPassword, user.password)
  if (isNewPasswordMatch) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng không sử dụng mật khẩu trước đó.')
  }
  
  user.password = newPassword
  user.tokenOtp = null
  await user.save()
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đặt lại mật khẩu thành công.'))
})

const profile = catchAsync(async (req, res) => {
  const { email } = req.user
  const user = await User.findOne({ email: email }).populate({
    path: 'coupleId',
    populate: 'userIdA userIdB'
  })
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'vui lòng đăng nhập.')
  }

  const userObj = user.toObject()
  if (!userObj.coupleId) {
    userObj.coupleId = null
  }
  const roomChat = await RoomChat.findOne({ coupleId: user.coupleId })
  if (roomChat) {
    userObj.roomChatId = roomChat.id
  }
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'lấy thông tin người dùng thành công.', userObj))
})

const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'người dùng không tồn tại.')
  }
  const otp = generate.generateNumber(4)
  const payload = {
    email,
    otp
  }
  const time = env.jwt.otp
  const secret_otp = env.jwt.secret_otp
  const tokenOtp = jwt.generateToken(payload, secret_otp, time)
  const subject = 'Mã xác nhận OTP'
  const sent = await SendMail(email, subject, otp, user.username)

  if (!sent) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Gửi OTP không thành công.')
  }
  user.tokenOtp = tokenOtp
  await user.save()
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi OTP thành công.', { email }))
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
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'cập nhật thông tin người dùng thành công.', userUpdate))
})

module.exports = {
  register,
  confirmOtp,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  profile,
  editProfile,
  sendOtp
}
