const { Message } = require('../../models')
const { ChatValidation } = require('../../validations')
const chat = (io, socket) => {
  socket.on('USER_SEND_MESSAGE', async (data) => {
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
}
