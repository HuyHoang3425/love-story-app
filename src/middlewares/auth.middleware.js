const { StatusCodes } = require('http-status-codes')

const { jwt } = require('../utils')
const { ApiError, catchAsync } = require('../utils')
const { User } = require('../models')
const { env } = require('../config')

const auth = catchAsync(async (req, res, next) => {
  const token = jwt.extractToken(req)
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'vui lòng đăng nhập!')
  }
  const secretLogin = env.jwt.secret_login
  const payload = jwt.verifyToken(token, secretLogin)
  const user = await User.findOne({ email: payload.email })
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'người dùng không tồn tại!')
  }
  req.user = user
  next()
})

module.exports = auth
