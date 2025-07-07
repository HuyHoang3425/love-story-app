const { StatusCodes } = require('http-status-codes')
const { jwt } = require('../utils')
const { ApiError, catchAsync } = require('../utils')
const { User } = require('../models')
const { env } = require('../config')

const authSocket = async (socket, next) => {
  const rawToken = socket.handshake.auth?.token || socket.handshake.headers?.authorization
  const token = rawToken?.replace('Bearer ', '')

  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Vui lòng đăng nhập!'))
  }
  const payload = jwt.verifyToken(token, env.jwt.secret_login)
  const user = await User.findById(payload.id)
  if (!user) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Người dùng không tồn tại!'))
  }
  socket.user = user
  next()
}

module.exports = authSocket
