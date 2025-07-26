const { Couple, DailyQuestion, Question } = require('../models')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

const { time } = require('../config/env.config')

dayjs.extend(utc)
dayjs.extend(timezone)

const generateDailyQuestionTomorrow = async () => {
  // Ngày mai
  const now = dayjs().tz(time.vn_tz)
  const startOfTomorrow = now.add(1, 'day').startOf('day').toDate()

  const couples = await Couple.find({})

  for (const couple of couples) {
    const exists = await DailyQuestion.exists({
      coupleId: couple._id,
      date: startOfTomorrow
    })

    if (!exists) {
      const usedQuestionIds = await DailyQuestion.find({ coupleId: couple.id }).distinct('questionId')
      const unusedQuestions = await Question.find({ _id: { $nin: usedQuestionIds } })

      if (unusedQuestions.length === 0) continue

      const randomQuestion = unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)]

      await DailyQuestion.create({
        coupleId: couple._id,
        questionId: randomQuestion._id,
        date: startOfTomorrow
      })
      console.log('đã tạo câu hỏi cho ngày mai')
    }
  }
}

const deleteUncompletedQuestions = async () => {
  const now = dayjs().tz(time.vn_tz).startOf('day').toDate()

  await DailyQuestion.deleteMany({
    date: { $lt: now },
    isCompleted: false
  })
}

module.exports = {
  generateDailyQuestionTomorrow,
  deleteUncompletedQuestions
}
