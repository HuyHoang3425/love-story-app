const { Message } = require('../../models')
const { ChatValidation } = require('../../validations')
const sendNot = require('./notification.handle')
const { Notification } = require('../../models') 
const { completeDailyMission } = require('../../services')

const chat = (io, socket) => {
  let roomChatId

  // Nếu socket đã có room sẵn
  if (socket.roomChatId) {
    roomChatId = socket.roomChatId
    socket.join(roomChatId)
  } else {
    // Lắng nghe sự kiện client gửi roomChatId
    socket.on('USER_SEND_ROOM_CHAT_ID', (data) => {
      roomChatId = data.roomChatId
      socket.roomChatId = data.roomChatId
      socket.join(roomChatId)
    })
  }
  // Gửi tin nhắn
  socket.on('USER_SEND_MESSAGE', async (data) => {
    if (!roomChatId) {
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
        roomChatId,
        senderId: socket.user.id,
        content: value.content,
        images: value.images
      })

      //thông báo
      const not = await Notification.create({
        coupleId: socket.user.coupleId,
        fromUserId: socket.user.id,
        toUserId: data.toUserId,
        type: 'chat_message',
        content: `${socket.user.username} vừa gửi một tin nhắn.`
      })
      sendNot(io, not)

      io.to(roomChatId).emit('SERVER_RETURN_MESSAGE', message)

      //hoàn thành nhiệm vụ
      const key = 'answer_question_together'
      await completeDailyMission(socket.user.id, socket.user.coupleId, key)
    } catch (err) {
      console.error('Message save error:', err)
      socket.emit('ERROR', {
        message: 'Gửi tin nhắn thất bại.'
      })
    }
  })

  // Hiển thị đang gõ
  socket.on('CLIENT_SEND_TYPING', (data) => {
    if (roomChatId) {
      socket.to(roomChatId).emit('SERVER_RETURN_TYPING', data)
    }
  })
}

module.exports = chat
