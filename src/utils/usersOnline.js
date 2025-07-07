const onlineUsers = new Map()

function addUser(userId, socketId) {
  onlineUsers.set(userId, socketId)
}

function removeUser(socketId) {
  for (const [userId, sid] of onlineUsers) {
    if (sid === socketId) {
      onlineUsers.delete(userId)
      break
    }
  }
}

function getSocketId(userId) {
  return onlineUsers.get(userId)
}

module.exports = { addUser, removeUser, getSocketId }
