const { StatusCodes } = require('http-status-codes')
const User = require('../../models/user.model')
const Couple = require('../../models/couples.model')

const couple = async (socket, io) => {
  const myUserId = socket.user.id
  const myUserName = socket.user.username
  //A gửi lời mời kết bạn cho B
  //A thuộc acceptFriends của B
  //B thuộc requestFrineds của A
  socket.on('USER_REQUEST_FRIEND', async (data) => {
    const userB = await User.findOne({
      coupleCode: data.coupleCode
    })
    const userA = await User.findOne({
      _id: myUserId
    })
    if (!userA) {
      return socket.emit('ERROR', {
        status: StatusCodes.UNAUTHORIZED,
        message: 'Vui lòng đăng nhập!'
      })
    }
    if (!userB) {
      console.log('Mã coupleCode không hợp lệ!')
      return socket.emit('ERROR', {
        status: StatusCodes.BAD_REQUEST,
        message: 'Mã coupleCode không hợp lệ!'
      })
    }
    if (userA._id.toString() === userB._id.toString()) {
      return socket.emit('ERROR', {
        status: StatusCodes.BAD_REQUEST,
        message: 'Không thể gửi lời mời cho chính mình!'
      })
    }
    if (userA.coupleId) {
      return socket.emit('ERROR', {
        status: StatusCodes.CONFLICT,
        message: 'Bạn đã có Couple rồi!'
      })
    }
    if (userB.coupleId) {
      return socket.emit('ERROR', {
        status: StatusCodes.CONFLICT,
        message: 'Người ta đã có Couple rồi!'
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
    //kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Gửi lời mời kết đôi thành công!'
    })

    socket.emit('SERVER_RETURN_USER_REQUEST', {
      myUserId: myUserId,
      yourUserId: userB.id,
      yourUserName: userB.username
    })

    socket.broadcast.emit('SERVER_RETURN_USER_ACCEPT', {
      myUserId: userB.id,
      yourUserId: myUserId,
      yourUserName: myUserName
    })
  })

  //A xoá lời mời kết bạn của mình cho B
  //xoá B khỏi requestFriends của A
  //xoá A khỏi acceptFriends của B
  socket.on('USER_CANCEL_FRIEND', async (data) => {
    const userA = await User.findOne({ _id: myUserId })
    const userB = await User.findOne({ _id: data.yourUserId })
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

    // Huỷ kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Huỷ kết đôi thành công!'
    })

    socket.emit('SERVER_RETURN_USER_CANCEL_REQUEST', {
      myUserId: userA.id,
      yourUserId: userB.id
    })

    socket.broadcast.emit('SERVER_RETURN_USER_CANCEL_ACCEPT', {
      myUserId: userB.id,
      yourUserId: userA.id
    })
  })

  //A từ chối lời mời kết bạn từ B
  //xoá B khỏi acceptFriends của A
  //xoá A khỏi requestFriends của B
  socket.on('USER_REFUSE_FRIEND', async (data) => {
    const userA = await User.findOne({ _id: myUserId })
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
    // Từ chối kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Từ chối kết đôi thành công!'
    })

    socket.emit('SERVER_RETURN_USER_REFUSE_ACCEPT', {
      myUserId: userA.id,
      yourUserId: userB.id
    })

    socket.broadcast.emit('SERVER_RETURN_USER_REFUSE_REQUEST', {
      myUserId: userB.id,
      yourUserId: userA.id
    })
  })

  //A chấp nhận yêu cầu của B
  socket.on('USER_ACCEPT_FRIEND', async (data) => {
    const userIdA = myUserId
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
    // Từ chối kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Kết đôi thành công!'
    })
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
        $set: {
          acceptFriends: [],
          requestFriends: []
        }
      }
    )
    await User.updateOne(
      { _id: userIdB },
      {
        $set: {
          acceptFriends: [],
          requestFriends: []
        }
      }
    )
  })
}
module.exports = {
  couple
}
