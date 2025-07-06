const { StatusCodes } = require('http-status-codes')
const User = require('../models/user.model')
const Couple = require('../models/couples.model')

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
      const existBinA = userA.requestFriends.includes(userB._id.toString())
      const existAinB = userB.acceptFriends.includes(userA._id.toString())

      if (existBinA && existAinB) {
        return socket.emit('ERROR', {
          status: StatusCodes.CONFLICT,
          message: 'Bạn đã gửi lời mời với người này.'
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
      socket.emit('SERVER_RETURN_USER_REQUEST', {
        myUserId: userA.id,
        userId: userB.id,
        userName: userB.username
      })

      socket.broadcast.emit('SERVER_RETURN_USER_ACCEPT', {
        myUserId: userB.id,
        userId: userA.id,
        userName: userA.username
      })
    })

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
      socket.emit('SERVER_RETURN_USER_CANCEL', {
        myUserId: userA.id,
        userId: userB.id,
        userName: userB.username
      })
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

      socket.emit('SERVER_RETURN_USER_REFUSE', {
        myUserId: userA.id,
        userId: userB.id,
        userName: userB.username
      })
    })

    //A chấp nhận yêu cầu của B
    socket.on('USER_ACCEPT_FRIEND', async (data) => {
      const userIdA = data.myUserId
      const userIdB = data.yourUserId

      const userA = await User.findById(userIdA)
      const userB = await User.findById(userIdB)

      if (!userA || !userB) {
        return socket.emit('ERROR', {
          status: StatusCodes.NOT_FOUND,
          message: 'Không tìm thấy user!'
        })
      }

      if (userA.coupleId || userB.coupleId) {
        return socket.emit('ERROR', {
          status: StatusCodes.CONFLICT,
          message: 'Bạn đã có Couple rồi!!!'
        })
      }

      const newCouple = await Couple.create({
        userIdA: userIdA,
        userIdB: userIdB,
        coin: 0,
        loveStartedAt: new Date()
      })
      await newCouple.save()

      await User.updateMany({ _id: { $in: [userIdA, userIdB] } }, { $set: { coupleId: newCouple._id } })
      await User.updateOne(
        { _id: userIdA },
        {
          $pull: { acceptFriends: data.userId },
          $pull: { requestFriends: data.userId }
        }
      )
      await User.updateOne(
        { _id: userIdB },
        {
          $pull: { requestFriends: data.myUserId },
          $pull: { acceptFriends: data.myUserId }
        }
      )
    })
  })
}
module.exports = {
  couple
}
