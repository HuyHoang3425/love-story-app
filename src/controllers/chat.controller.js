const { response } = require('../utils')
const { catchAsync } = require('../utils')
const { StatusCodes } = require('http-status-codes') 
const { RoomChat, Message } = require('../models')

const getMessages = catchAsync(async (req, res) => {
  const user = req.user
  const { limit = 20, before } = req.query
  const roomChat = await RoomChat.findOne({ coupleId: user.coupleId })

  const condition = { roomChatId: roomChat._id }
  if (before) {
    condition.sentAt = { $lt: new Date(before) } 
  }

  const messages = await Message.find(condition)
    .populate('senderId', 'username avatar')
    .sort({ sentAt: -1 })
    .limit(+limit)
    .lean()

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy danh sách tin nhắn thành công.', {
      messages: messages.reverse() 
    })
  )
})


module.exports = {
  getMessages
}
