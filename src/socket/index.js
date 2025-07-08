const { Server } = require('socket.io')

const coupleHandle = require('./handlers/couple.handle')
const { authSocket } = require('../middlewares/')
const { usersOnline } = require('../utils')

module.exports.initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  })

  io.use(authSocket)

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    usersOnline.addUser(socket.user.id, socket.id)

    coupleHandle.couple(socket, io)

    socket.on('disconnect', () => {
      usersOnline.removeUser(socket.user.id)
      console.log('Socket disconnected:', socket.id)
    })
  })
}
