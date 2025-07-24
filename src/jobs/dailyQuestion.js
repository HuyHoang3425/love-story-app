const { Couple, DailyQuestion, Question } = require('../models')

const generateDailyQuestionTomorrow = async () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  const couples = await Couple.find({})

  for (const couple of couples) {
    const exists = await DailyQuestion.exists({
      coupleId: couple._id,
      date: tomorrow
    })

    if (!exists) {
      const usedQuestionIds = await DailyQuestion.find({ coupleId: couple.id }).distinct('questionId')
      const unusedQuestions = await Question.find({ _id: { $nin: usedQuestionIds } })

      if (unusedQuestions.length === 0) continue

      const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)]

      await DailyQuestion.create({
        coupleId: couple._id,
        questionId: randomQuestion._id,
        date: tomorrow
      })
      console.log('đã tạo câu hỏi cho ngày mai')
    }
  }
}

const deleteUncompletedQuestions = async () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await DailyQuestion.deleteMany({
    date: { $lt: today },
    isCompleted: false
  })
}

module.exports = {
  generateDailyQuestionTomorrow,
  deleteUncompletedQuestions
}
