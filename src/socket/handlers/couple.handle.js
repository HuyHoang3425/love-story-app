const { StatusCodes } = require('http-status-codes')
const { User, Couple, DailyQuestion, Question, Mission, CoupleMissionLog } = require('../../models')
const { usersOnline, catchAsync } = require('../../utils')
const { scheduleDailyQuestion, DailyMission } = require('../../jobs')

const couple = catchAsync(async (socket, io) => {
  const myUserId = socket.user.id
  const myUserName = socket.user.username
  //A gửi lời mời kết bạn cho B
  //A thuộc acceptFriends của B
  //B thuộc requestFrineds của A
  socket.on('USER_REQUEST_FRIEND', async (data) => {
    const userB = await User.findOne({
      coupleCode: data.coupleCode
    })
    if (!userB) {
      console.log('Mã coupleCode không hợp lệ!')
      return socket.emit('ERROR', {
        status: StatusCodes.BAD_REQUEST,
        message: 'Mã coupleCode không hợp lệ!'
      })
    }

    const userA = socket.user
    const userIdB = userB.id
    const socketId = usersOnline.getSocketId(userIdB)

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
    //A gửi B
    //bạn vừa gửi lời mời cho B
    socket.emit('SERVER_RETURN_USER_REQUEST', {
      myUserId: myUserId,
      yourUserId: userB.id,
      yourUserName: userB.username
    })
    //B nhận gửi A
    // A vừa gửi lời mời cho bạn
    if (socketId) {
      socket.to(socketId).emit('SERVER_RETURN_USER_ACCEPT', {
        myUserId: userB.id,
        yourUserId: myUserId,
        yourUserName: myUserName
      })
    }
  })

  //A xoá lời mời kết bạn của mình cho B
  //xoá B khỏi requestFriends của A
  //xoá A khỏi acceptFriends của B
  socket.on('USER_CANCEL_FRIEND', async (data) => {
    const userA = socket.user
    const userB = await User.findOne({ _id: data.yourUserId })
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

    const userIdB = userB.id
    const socketId = usersOnline.getSocketId(userIdB)

    // Huỷ kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Huỷ kết đôi thành công!'
    })

    socket.emit('SERVER_RETURN_USER_CANCEL_REQUEST', {
      myUserId: userA.id,
      yourUserId: userB.id
    })

    if (socketId) {
      socket.to(socketId).emit('SERVER_RETURN_USER_CANCEL_ACCEPT', {
        myUserId: userB.id,
        yourUserId: userA.id
      })
    }
  })

  //A từ chối lời mời kết bạn từ B
  //xoá B khỏi acceptFriends của A
  //xoá A khỏi requestFriends của B
  socket.on('USER_REFUSE_FRIEND', async (data) => {
    const userA = socket.user
    const userB = await User.findOne({ _id: data.userId })

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

    const userIdB = userB.id
    const socketId = usersOnline.getSocketId(userIdB)

    socket.emit('SERVER_RETURN_USER_REFUSE_ACCEPT', {
      myUserId: userA.id,
      yourUserId: userB.id
    })

    if (socketId) {
      socket.to(socketId).emit('SERVER_RETURN_USER_REFUSE_REQUEST', {
        myUserId: userB.id,
        yourUserId: userA.id
      })
    }
  })

  //A chấp nhận yêu cầu của B
  socket.on('USER_ACCEPT_FRIEND', async (data) => {
    const userIdA = myUserId
    const userIdB = data.yourUserId

    const userA = socket.user
    const userB = await User.findById(userIdB)

    if (!userB) {
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
    // thông báo kết bạn thành công
    socket.emit('SUCCESS', {
      message: 'Kết đôi thành công!'
    })

    const newCouple = await Couple.create({
      userIdA,
      userIdB
    })
    await newCouple.save()
    //tạo câu hỏi đầu tiên
    //tạo các nhiệm vụ đầu tiên
    //toạ câu hỏi cho ngày mai
    //tạo nhiệm vụ cho ngày mai
    const todayQuestion = new Date().toISOString().slice(0, 10)
    const usedQuestionIds = await DailyQuestion.find({ coupleId: newCouple._id }).distinct('questionId')
    const unusedQuestions = await Question.find({ _id: { $nin: usedQuestionIds } })

    const todayMission = new Date()
    todayMission.setHours(0, 0, 0, 0)
    const bulk = []
    const missions = await Mission.find({ isActive: true })
    missions.forEach((mission) => {
      bulk.push({
        coupleId: newCouple._id,
        missionId: mission._id,
        dateAssigned: new Date(todayMission)
      })
    })

    await Promise.all([
      (async () => {
        if (unusedQuestions.length > 0) {
          const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)]
          await DailyQuestion.create({
            coupleId: newCouple._id,
            questionId: randomQuestion._id,
            date: new Date(todayQuestion)
          })
        }
      })(),
      (async () => {
        if (bulk.length > 0) {
          await CoupleMissionLog.insertMany(bulk, { ordered: false })
        }
      })(),
      (async () => await scheduleDailyQuestion.scheduleDailyQuestion())(),
      (async () => await DailyMission.generateDailyMissions())()
    ])

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

    const socketId = usersOnline.getSocketId(userIdB)

    socket.emit('SERVER_RETURN_USER_ACCEPT_ACCEPT', {
      myUserId: userA.id,
      yourUserId: userB.id
    })

    if (socketId) {
      socket.to(socketId).emit('SERVER_RETURN_USER_REQUEST_REQUEST', {
        myUserId: userB.id,
        yourUserId: userA.id
      })
    }
  })
})
module.exports = {
  couple
}
