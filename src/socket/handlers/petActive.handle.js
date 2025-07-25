const { StatusCodes } = require('http-status-codes')

const { usersOnline } = require('../../utils')

const petActive = (socket) => {
  socket.on('USER_SEND_PET_ACTIVE', (data) => {
    const socketId = usersOnline.getSocketId(data.myLoveId)
    if (socketId) {
      socket.to(socketId).emit('SERVER_SEND_PET_ACTIVE', data)
    } else {
      return socket.emit('ERROR', {
        status: StatusCodes.BAD_REQUEST,
        message: 'danh sách trống không tìm thấy user'
      })
    }
  })
}

module.exports = petActive
