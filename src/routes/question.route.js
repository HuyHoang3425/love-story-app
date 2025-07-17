const express = require('express')
const questionRouter = express.Router()

const { QuestionController } = require('../controllers/index')
const { auth, authCouple, validate, authAdmin } = require('../middlewares')
const { QuestionValidation } = require('../validations')

questionRouter.get('/', auth, authCouple, QuestionController.getQuestion)

questionRouter.post(
  '/',
  auth,
  authAdmin,
  validate(QuestionValidation.createQuestion),
  QuestionController.createQuestion
)

questionRouter.put(
  '/:questionId',
  auth,
  authAdmin,
  validate(QuestionValidation.editQuestion),
  QuestionController.editQuestion
)

questionRouter.delete(
  '/:questionId',
  auth,
  authAdmin,
  validate(QuestionValidation.deleteQuestion),
  QuestionController.deleteQuestion
)

questionRouter.post(
  '/daily',
  auth,
  authCouple,
  validate(QuestionValidation.dailyQuestion),
  QuestionController.dailyQuestion
)

questionRouter.get('/daily', auth, authCouple, QuestionController.getDailyQuestion)

questionRouter.get('/daily/feedback', auth, authCouple, QuestionController.getDailyQuestionFeedback)

module.exports = questionRouter
