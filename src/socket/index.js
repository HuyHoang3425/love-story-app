const { Server } = require('socket.io')

const coupleHandle = require('./handlers/couple.handle')
const { authSocket } = require('../middlewares/')
const { usersOnline } = require('../utils')

let io = null

module.exports.initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  })

  io.use(authSocket)

  io.on('connection', (socket) => {

    usersOnline.addUser(socket.user.id, socket.id)

    coupleHandle.couple(socket, io)

    socket.on('disconnect', () => {
      usersOnline.removeUser(socket.user.id)
    })
  })
}

module.exports.getIO = () => {
  return io
}
