const { StatusCodes } = require('http-status-codes')

const { catchAsync, response, ApiError } = require('../utils')
const { Question, DailyQuestion } = require('../models')

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
  const today = new Date().toISOString().slice(0, 10)

  let dailyQuestion = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: today
  }).populate('questionId')

  if (!dailyQuestion) {
    const usedQuestionIds = await DailyQuestion.find({ coupleId: user.coupleId }).distinct('questionId')
    const unusedQuestions = await Question.find({ _id: { $nin: usedQuestionIds } })

    if (unusedQuestions.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Hết câu hỏi!')
    }

    const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)]
    dailyQuestion = await DailyQuestion.create({
      coupleId: user.coupleId,
      questionId: randomQuestion._id,
      date: new Date(today)
    })

    dailyQuestion.questionId = randomQuestion
  }

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy câu hỏi hôm nay thành công.', {
      question: dailyQuestion.questionId
    })
  )
})

const dailyQuestion = catchAsync(async (req, res) => {
  const { answer } = req.body
  const user = req.user
  const today = new Date().toISOString().slice(0, 10)
  let log = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: today
  }).populate({
    path: 'coupleId',
    select: 'userIdA userIdB'
  })

  if (!log) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy câu hỏi hôm nay.')
  }

  const checkIdA = user.id.toString() === log.coupleId.userIdA.toString()
  const checkIdB = user.id.toString() === log.coupleId.userIdB.toString()

  if (log.answerUserA && checkIdA) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã trả lời rồi.')
  }

  if (log.answerUserB && checkIdB) {
    throw new ApiError(StatusCodes.CONFLICT, 'Bạn đã trả lời rồi.')
  }

  if (checkIdA) {
    log.answerUserA = answer.trim()
    log.userAAnsweredAt = new Date()
  } else if (checkIdB) {
    log.answerUserB = answer.trim()
    log.userBAnsweredAt = new Date()
  }

  if (log.answerUserA && log.answerUserB) {
    log.isCompleted = true
  }

  const updatedLog = await log.save()

  return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi câu trả lời thành công.', { updatedLog }))
})

const getDailyQuestionFeedback = catchAsync(async (req, res) => {
  const user = req.user
  const today = new Date().toISOString().slice(0, 10)
  let log = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: today
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
