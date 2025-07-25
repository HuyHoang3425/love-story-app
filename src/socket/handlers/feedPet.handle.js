const { usersOnline, catchAsync } = require('../../utils')

const feedPet = (io, receiverId, userId, data) => {
  const socketReceiverId = usersOnline.getSocketId(receiverId.toString())
  const socketUserId = usersOnline.getSocketId(userId.toString())
  io.to(socketReceiverId).emit('SERVER_FEED_PET_SUCCESS', data)
  io.to(socketUserId).emit('SERVER_FEED_PET_SUCCESS', data)
}

module.exports = {
  feedPet
}
