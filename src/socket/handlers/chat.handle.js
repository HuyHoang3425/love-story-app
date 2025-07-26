const { Message } = require('../../models')
const { ChatValidation } = require('../../validations')

const chat = (io, socket) => {
  // Handle JOIN_ROOM event
  socket.on('JOIN_ROOM', (data) => {
    console.log('User joining room:', data.roomChatId)
    socket.roomChatId = data.roomChatId
    socket.join(data.roomChatId)
  })

  socket.on('USER_SEND_MESSAGE', async (data) => {
    if (!socket.roomChatId) {
      return socket.emit('ERROR', {
        message: 'bạn chưa kết nối Couple'
      })
    }

    const { error, value } = ChatValidation.message.validate(data)
    if (error) {
      return socket.emit('ERROR', {
        type: 'MESSAGE_VALIDATION',
        message: error.message
      })
    }

    await Message.create({
      roomChatId: socket.roomChatId,
      senderId: value.senderId,
      content: value.content,
      images: value.images
    })

    io.to(socket.roomChatId).emit('SERVER_RETURN_MESSAGE', value)
  })

  socket.on('CLIENT_SEND_TYPING', (data) => {
    if (!socket.roomChatId) {
      return socket.emit('ERROR', {
        message: 'bạn chưa kết nối Couple'
      })
    }

    socket.to(socket.roomChatId).emit('SERVER_RETURN_TYPING', data)
  })
}

module.exports = chat
