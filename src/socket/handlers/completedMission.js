const { usersOnline, catchAsync } = require('../../utils')

const completedMission = (io, receiverId, userId, data) => {
  const socketReceiverId = usersOnline.getSocketId(receiverId.toString())
  const socketUserId = usersOnline.getSocketId(userId.toString())
  io.to(socketReceiverId).emit('SERVER_RETURN_MISSION_COMPLETED', data)
  io.to(socketUserId).emit('SERVER_RETURN_MISSION_COMPLETED', data)
}

module.exports = {
  completedMission
}
