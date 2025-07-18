const { usersOnline, catchAsync } = require('../../utils')

const feedPet = (io, receiverId, userId, data) => {
  const socketReceiverId = usersOnline.getSocketId(receiverId)
  const socketUserId = usersOnline.getSocketId(userId)
  io.to(socketReceiverId).emit('SERVER_FEED_PET_SUCCESS', data)
  io.to(socketUserId).emit('SERVER_FEED_PET_SUCCESS', data)
}

module.exports = {
  feedPet
}
