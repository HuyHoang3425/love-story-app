const joi = require('joi')

const createQuestion = joi.object({
  question: joi.string().trim().min(3).max(500).required().messages({
    'string.base': 'Câu hỏi phải là chuỗi.',
    'string.empty': 'Câu hỏi không được để trống.',
    'string.min': 'Câu hỏi phải dài ít nhất 3 ký tự.',
    'any.required': 'Câu hỏi là bắt buộc.'
  })
})

const editQuestion = joi.object({
  question: joi.string().trim().min(3).max(500).optional().messages({
    'string.base': 'Câu hỏi phải là chuỗi.',
    'string.min': 'Câu hỏi phải dài ít nhất 3 ký tự.'
  })
})

module.exports = {
  createQuestion,
  editQuestion
}
