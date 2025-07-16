const { usersOnline, catchAsync } = require('../../utils')

const feedPet = (io, receiverId, data) => {
  const socketReceiverId = usersOnline.getSocketId(receiverId)
  io.to(socketReceiverId).emit('SERVER_FEED_PET_SUCCESS', data)
}

module.exports = {
  feedPet
}