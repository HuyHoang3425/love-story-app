const { StatusCodes } = require('http-status-codes')
const { jwt } = require('../utils')
const { ApiError, catchAsync } = require('../utils')
const { User, RoomChat } = require('../models')
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
  const roomChat = await RoomChat.findOne({ coupleId: user.coupleId })
  if (!roomChat) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền truy cập room chat'))
  }
  socket.user = user
  socket.roomChatId = roomChat.id
  next()
}

module.exports = authSocket
