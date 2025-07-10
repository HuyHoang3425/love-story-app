// models/dailyQuestion.model.js
const mongoose = require('mongoose')

const dailyQuestionSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Couple',
      required: true
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    answerUserA: {
      type: String
    },
    answerUserB: {
      type: String
    },
    userAAnsweredAt: {
      type: Date
    },
    userBAnsweredAt: {
      type: Date
    },
    isCompleted:{
      type:Boolean,
      default:false,
    }
  },
  {
    timestamps: true 
  }
)

module.exports = mongoose.model('DailyQuestion', dailyQuestionSchema)
