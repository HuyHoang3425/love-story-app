const { StatusCodes } = require('http-status-codes')
const User = require('../models/user.model')

const couple = async (req, res) => {
  io.once('connection', (socket) => {
    console.log('đã kết nối')
    //A gửi lời mời kết bạn cho B
    //A thuộc acceptFriends của B
    //B thuộc requestFrineds của A
    socket.on('USER_REQUEST_FRIEND', async (data) => {
      const userB = await User.findOne({
        coupleCode: data.coupleCode
      })
      const userA = await User.findOne({
        _id: data.userId
      })
      if (!userA) {
        return socket.emit('ERROR', {
          status: StatusCodes.UNAUTHORIZED,
          message: 'Vui lòng đăng nhập!'
        })
      }
      if (!userB) {
        return socket.emit('ERROR', {
          status: StatusCodes.BAD_REQUEST,
          message: 'Mã coupleCode không hợp lệ!'
        })
      }
      await User.updateOne(
        { _id: userA.id },
        {
          $addToSet: { requestFriends: userB.id }
        }
      )
      await User.updateOne(
        { _id: userB.id },
        {
          $addToSet: { acceptFriends: userA.id }
        }
      )
    })

    // socket.broadcast.emit()

    //A xoá lời mời kết bạn của mình cho B
    //xoá B khỏi requestFriends của A
    //xoá A khỏi acceptFriends của B
    socket.on('USER_CANCEL_FRIEND', async (data) => {
      const userA = await User.findOne({ _id: data.myUserId })
      const userB = await User.findOne({ _id: data.userId })
      if (!userA) {
        return socket.emit('ERROR', {
          status: StatusCodes.UNAUTHORIZED,
          message: 'Vui lòng đăng nhập!'
        })
      }
      if (!userB) {
        return socket.emit('ERROR', {
          status: StatusCodes.BAD_REQUEST,
          message: 'danh sách trống không tìm thấy user'
        })
      }
      await User.updateOne(
        { _id: userA.id },
        {
          $pull: { requestFriends: userB.id }
        }
      )
      await User.updateOne(
        { _id: userB.id },
        {
          $pull: { acceptFriends: userA.id }
        }
      )
    })

    //A từ chối lời mời kết bạn từ B
    //xoá B khỏi acceptFriends của A
    //xoá A khỏi requestFriends của B
    socket.on('USER_REFUSE_FRIEND', async (data) => {
      const userA = await User.findOne({ _id: data.myUserId })
      const userB = await User.findOne({ _id: data.userId })
      if (!userA) {
        return socket.emit('ERROR', {
          status: StatusCodes.UNAUTHORIZED,
          message: 'Vui lòng đăng nhập!'
        })
      }
      if (!userB) {
        return socket.emit('ERROR', {
          status: StatusCodes.BAD_REQUEST,
          message: 'danh sách trống không tìm thấy user'
        })
      }
      await User.updateOne(
        { _id: userA.id },
        {
          $pull: { acceptFriends: userB.id }
        }
      )
      await User.updateOne(
        { _id: userB.id },
        {
          $pull: { requestFriends: userA.id }
        }
      )
    })
  })

}
module.exports = {
  couple
}
