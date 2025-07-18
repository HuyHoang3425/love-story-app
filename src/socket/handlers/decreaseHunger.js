const { usersOnline } = require('../../utils')

const decreaseHunger = (io, userIdA, userIdB, data) => {
  const socketUserA = usersOnline.getSocketId(userIdA)
  const socketUserB = usersOnline.getSocketId(userIdB)
  io.to(socketUserA).emit('PET_DECREASE_HUNGER', data)
  io.to(socketUserB).emit('PET_DECREASE_HUNGER', data)
}

module.exports = {
  decreaseHunger
}
