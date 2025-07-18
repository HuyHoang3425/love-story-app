const cron = require('node-cron')
const { Couple, DailyQuestion, Question } = require('../models')

let isStarted = false
const scheduleDailyQuestion = () => {
  if (isStarted) return
  isStarted = true

  cron.schedule(
    '0 23 * * *',
    async () => {
      const today = new Date()
      today.setDate(today.getDate() + 1)
      const tomorrow = today.toISOString().slice(0, 10)

      const couples = await Couple.find({})

      for (const couple of couples) {
        const existing = await DailyQuestion.findOne({
          coupleId: couple._id,
          date: tomorrow
        })

        if (existing) continue

        const usedQuestionIds = await DailyQuestion.find({ coupleId: couple.id }).distinct('questionId')
        const unusedQuestions = await Question.find({ _id: { $nin: usedQuestionIds } })

        if (unusedQuestions.length === 0) continue

        const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)]

        await DailyQuestion.create({
          coupleId: couple._id,
          questionId: randomQuestion._id,
          date: new Date(tomorrow)
        })
      }
    },
    {
      timezone: 'Asia/Ho_Chi_Minh'
    }
  )
}

const cleanIncompleteQuestions = async () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  const endOfYesterday = new Date(yesterday)
  endOfYesterday.setHours(23, 59, 59, 999)

  await DailyQuestion.deleteMany({
    date: { $gte: yesterday, $lte: endOfYesterday },
    $or: [{ answerUserA: null }, { answerUserB: null }, { isCompleted: false }]
  })
}


module.exports = {
  scheduleDailyQuestion,
  cleanIncompleteQuestions
}
