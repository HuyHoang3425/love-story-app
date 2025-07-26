const { StatusCodes } = require('http-status-codes')

const { completeDailyMission } = require('../services')
const { catchAsync, response, ApiError } = require('../utils')
const { Question, DailyQuestion, Mission, Couple, Notification } = require('../models')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const { time } = require('../config/env.config')
const { couple } = require('../socket/handlers/couple.handle')

dayjs.extend(utc)
dayjs.extend(timezone)

const getQuestion = catchAsync(async (req, res) => {
  const questions = await Question.find()
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Lấy câu hỏi thành công.', { questions }))
})

const createQuestion = catchAsync(async (req, res) => {
  const newQuestion = await Question.create(req.body)
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Tạo câu hỏi thành công.', { newQuestion }))
})

const editQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.params
  const question = await Question.findById(questionId)
  if (!question) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Câu hỏi không tồn tại.')
  }

  const update = await Question.findByIdAndUpdate(questionId, req.body, { new: true })
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Cập nhật câu hỏi thành công.', { update }))
})

const deleteQuestion = catchAsync(async (req, res) => {
  const { questionId } = req.params
  const question = await Question.findById(questionId)
  if (!question) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Câu hỏi không tồn tại.')
  }

  await Question.deleteOne({ _id: questionId })
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xoá câu hỏi thành công.'))
})

const getDailyQuestion = catchAsync(async (req, res) => {
  const user = req.user
  const startOfToday = dayjs().tz(time.vn_tz).startOf('day').toDate()
  const endOfToday = dayjs().tz(time.vn_tz).endOf('day').toDate()

  let dailyQuestion = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: { $gte: startOfToday, $lte: endOfToday }
  }).populate('questionId')

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy câu hỏi hôm nay thành công.', {
      question: dailyQuestion.questionId
    })
  )
})

const dailyQuestion = catchAsync(async (req, res) => {
  const { answer } = req.body
  const user = req.user

  const startOfToday = dayjs().tz(time.vn_tz).startOf('day').toDate()
  const endOfToday = dayjs().tz(time.vn_tz).endOf('day').toDate()

  const [log, couple] = await Promise.all([
    DailyQuestion.findOne({
      coupleId: user.coupleId,
      date: { $gte: startOfToday, $lte: endOfToday }
    })
      .populate({
        path: 'coupleId',
        select: 'userIdA userIdB'
      })
      .select('-createdAt -updatedAt -__v'),

    Couple.findById(user.coupleId)
  ])

  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi hôm nay.')
  }

  const checkIdA = user.id.toString() === log.coupleId.userIdA.toString()
  const checkIdB = user.id.toString() === log.coupleId.userIdB.toString()

  if ((log.answerUserA && checkIdA) || (log.answerUserB && checkIdB)) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã trả lời rồi.')
  }

  if (checkIdA) {
    log.answerUserA = answer.trim()
    log.userAAnsweredAt = dayjs().tz(time.vn_tz).toDate()
  } else if (checkIdB) {
    log.answerUserB = answer.trim()
    log.userBAnsweredAt = dayjs().tz(time.vn_tz).toDate()
  }

  if (log.answerUserA && log.answerUserB) {
    log.isCompleted = true
  }
  const updatedLog = await log.save()
  //thông báo cho người kia là đã trả lời
  const receiverId = couple.userIdB == user.id ? couple.userIdA : couple.userIdB
  const not = await Notification.create({
    coupleId: user.coupleId,
    fromUserId: user.id,
    toUserId: receiverId,
    type: 'feed_pet',
    content: `${user.username} vừa cho Pet ăn.`
  })

  sendNot(io, not)
  //hoàn thành nhiệm vụ trả lời câu hỏi
  const key = 'answer_question_together'
  await completeDailyMission(user.id, user.coupleId, key)

  return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi câu trả lời thành công.', { updatedLog }))
})

const getDailyQuestionFeedback = catchAsync(async (req, res) => {
  const user = req.user

  const startOfToday = dayjs().tz(time.vn_tz).startOf('day').toDate()
  const endOfToday = dayjs().tz(time.vn_tz).endOf('day').toDate()

  let log = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: { $gte: startOfToday, $lte: endOfToday }
  }).populate({
    path: 'coupleId',
    select: 'userIdA userIdB'
  })

  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi hôm nay.')
  }

  const checkIdA = user.id.toString() === log.coupleId.userIdA.toString()
  const checkIdB = user.id.toString() === log.coupleId.userIdB.toString()

  let partnerAnswer = null
  if (checkIdA) {
    partnerAnswer = log.answerUserB
  } else if (checkIdB) {
    partnerAnswer = log.answerUserA
  }

  const currentUserAnswer = checkIdA ? log.answerUserA : log.answerUserB
  if (!currentUserAnswer) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn cần trả lời câu hỏi trước khi xem câu trả lời của cậu ấy.')
  }

  if (!partnerAnswer) {
    return res
      .status(StatusCodes.OK)
      .json(response(StatusCodes.OK, 'Cậu ấy chưa trả lời câu hỏi hôm nay.', { partnerAnswer: null }))
  }

  return res
    .status(StatusCodes.OK)
    .json(response(StatusCodes.OK, 'Lấy câu trả lời của cậu ấy thành công.', { partnerAnswer }))
})

module.exports = {
  getQuestion,
  createQuestion,
  editQuestion,
  deleteQuestion,
  dailyQuestion,
  getDailyQuestion,
  getDailyQuestionFeedback
}
