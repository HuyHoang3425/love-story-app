const { usersOnline } = require('../../utils')

const sendKey = (io, socket) => {
  socket.on('USER_SEND_PUBLIC_KEY', (data) => {
    console.log('🔥 USER_SEND_PUBLIC_KEY: ', data)
    const socketMyLove = usersOnline.getSocketId(data.myLoveId?.toString())

    console.log('🔍 socketMyLove:', socketMyLove)

    if (!socketMyLove) {
      socket.emit('ERROR', { message: 'Không tìm thấy người yêu đang online' })
      return
    }

    io.to(socketMyLove).emit('SERVER_RETURN_PUBLIC_KEY', {
      public_key: data.public_key,
      fromUserId: socket.user?.id || null
    })
  })
}

module.exports = {
  sendKey
}
