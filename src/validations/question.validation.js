const joi = require('joi')

const { objectId } = require('./custom.validation')

const createQuestion = {
  body: joi.object({
    question: joi.string().trim().min(3).max(500).required().messages({
      'string.base': 'Câu hỏi phải là chuỗi.',
      'string.empty': 'Câu hỏi không được để trống.',
      'string.min': 'Câu hỏi phải dài ít nhất 3 ký tự.',
      'any.required': 'Câu hỏi là bắt buộc.'
    })
  })
}

const editQuestion = {
  params: joi.object({
    questionId: joi.string().custom(objectId).required().messages({
      'string.pattern.base': 'questionId không hợp lệ.',
      'string.empty': 'questionId không được để trống.',
      'any.required': 'questionId là bắt buộc.'
    })
  }),
  body: joi.object({
    question: joi.string().trim().min(3).max(500).optional().messages({
      'string.base': 'Câu hỏi phải là chuỗi.',
      'string.min': 'Câu hỏi phải dài ít nhất 3 ký tự.'
    })
  })
}

const deleteQuestion = {
  params: joi.object({
    questionId: joi.string().custom(objectId).required().messages({
      'string.pattern.base': 'questionId không hợp lệ.',
      'string.empty': 'questionId không được để trống.',
      'any.required': 'questionId là bắt buộc.'
    })
  })
}

const dailyQuestion = {
  body: joi.object({
    answer: joi.string().trim().required().messages({
      'string.base': 'Câu trả lời phải là chuỗi.',
      'string.empty': 'Câu trả lời không được để trống.',
      'any.required': 'Câu trả lời là bắt buộc.'
    })
  })
}
module.exports = {
  createQuestion,
  editQuestion,
  deleteQuestion,
  dailyQuestion
}
