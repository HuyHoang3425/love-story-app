const { usersOnline } = require('../../utils')

const sendNot = (io, not) => {
  const socketId = usersOnline.getSocketId(not.toUserId.toString())
  if (!socketId) return

  io.to(socketId).emit('SERVER_SEND_NOT_TO_USER', {
    not
  })
}

module.exports = sendNot
