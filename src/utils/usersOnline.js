const onlineUsers = new Map() // Map<userId, Set<socketId>>

function addUser(userId, socketId) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set())
  }
  onlineUsers.get(userId).add(socketId)
}

function removeUser(socketId) {
  for (const [userId, socketSet] of onlineUsers) {
    if (socketSet.has(socketId)) {
      socketSet.delete(socketId)
      if (socketSet.size === 0) {
        onlineUsers.delete(userId)
      }
      break
    }
  }
}

function getSocketId(userId) {
  const socketSet = onlineUsers.get(userId)
  if (!socketSet || socketSet.size === 0) return null
  return [...socketSet][0]
}

module.exports = {
  addUser,
  removeUser,
  getSocketId,
  onlineUsers 
}
