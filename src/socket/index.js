const { Server } = require('socket.io')

const coupleHandle = require('./handlers/couple.handle')
const { authSocket } = require('../middlewares/')
const { usersOnline } = require('../utils')
const chat = require('./handlers/chat.handle')
const petActive = require('./handlers/petActive.handle')

let io = null

module.exports.initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  })

  io.use(authSocket)

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    usersOnline.addUser(socket.user.id, socket.id)

    coupleHandle.couple(socket, io)

    petActive(socket)

    chat(io, socket)

    socket.on('disconnect', () => {
      usersOnline.removeUser(socket.user.id)
      console.log('Socket disconnected:', socket.id)
    })
  })
}

module.exports.getIO = () => {
  return io
}
