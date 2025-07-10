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

const dailyQuestion = catchAsync(async (req, res) => {
  const { answer, questionId } = req.body
  const user = req.user
  let log = await DailyQuestion.findOne({
    coupleId: user.coupleId,
    date: today
  })

  if (!log) {
    const newLog = await DailyQuestion.create({
      coupleId: user.coupleId,
      questionId,
      answerUserA: user._id.equals(user.coupleId.userIdA) ? answer : undefined,
      userAAnsweredAt: user._id.equals(user.coupleId.userIdA) ? new Date() : undefined,
      answerUserB: user._id.equals(user.coupleId.userIdB) ? answer : undefined,
      userBAnsweredAt: user._id.equals(user.coupleId.userIdB) ? new Date() : undefined,
      date: today
    })

    return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi câu trả lời thành công.', { newLog }))
  }

  const updateData = {}
  if (user._id.equals(log.coupleId.userIdA)) {
    updateData.answerUserA = answer
    updateData.userAAnsweredAt = new Date()
  } else if (user._id.equals(log.coupleId.userIdB)) {
    updateData.answerUserB = answer
    updateData.userBAnsweredAt = new Date()
  } else {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không thuộc couple này.')
  }
  updateData.isCompleted = true

  const updatedLog = await DailyQuestion.findByIdAndUpdate(log._id, updateData, { new: true })

  return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Gửi câu trả lời thành công.', { updatedLog }))
})

module.exports = {
  getQuestion,
  createQuestion,
  editQuestion,
  deleteQuestion,
  dailyQuestion
}
