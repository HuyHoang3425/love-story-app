const { User} = require('../models')
const { StatusCodes } = require('http-status-codes')

const { catchAsync, ApiError, response } = require('../utils')

const { generate, jwt } = require('../utils')
const { SendMail } = require('../services')

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

  const tokenOtp = jwt.generateToken(payload)
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

const confirmOtp = catchAsync(async (req, res) => {
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
      { isVerifiedToken: true, tokenOtp: "" },
      { new: true } 
    )

    res.status(StatusCodes.CREATED).json(response(StatusCodes.OK, 'Đăng ký thành công.', updatedUser))
  }
})

module.exports = {
  register,
  confirmOtp
}
