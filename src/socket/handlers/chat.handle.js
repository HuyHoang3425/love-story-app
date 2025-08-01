const { Message } = require('../../models')
const { ChatValidation } = require('../../validations')

const chat = (io, socket) => {
  // Join room nếu có roomChatId
  if (socket.roomChatId) {
    socket.join(socket.roomChatId)
  }

  // Gửi tin nhắn
  socket.on('USER_SEND_MESSAGE', async (data) => {
    if (!socket.roomChatId) {
      return socket.emit('ERROR', {
        message: 'Bạn chưa kết nối Couple'
      })
    }

    const { error, value } = ChatValidation.message.validate(data)
    if (error) {
      return socket.emit('ERROR', {
        type: 'MESSAGE_VALIDATION',
        message: error.message
      })
    }

    try {
      const message = await Message.create({
        roomChatId: socket.roomChatId,
        senderId: socket.user.id,
        content: value.content,
        images: value.images
      })

      io.to(socket.roomChatId).emit('SERVER_RETURN_MESSAGE', message)
    } catch (err) {
      console.error('Message save error:', err)
      socket.emit('ERROR', {
        message: 'Gửi tin nhắn thất bại.'
      })
    }
  })

  // Hiển thị đang gõ
  socket.on('CLIENT_SEND_TYPING', (data) => {
    socket.to(socket.roomChatId).emit('SERVER_RETURN_TYPING', data)
  })
}

module.exports = chat
