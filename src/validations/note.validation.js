const joi = require('joi')

const createNote = joi.object({
  content: joi.string().required().messages({
    'string.empty': 'Nội dung ghi chú không được để trống.',
    'any.required': 'Nội dung ghi chú là bắt buộc.'
  }),
  date: joi.date().required().messages({
    'date.base': 'Ngày không hợp lệ.',
    'any.required': 'Ngày là bắt buộc.'
  })
})

const editNote = joi.object({
  content: joi.string().required().messages({
    'string.empty': 'Nội dung ghi chú không được để trống.',
    'any.required': 'Nội dung ghi chú là bắt buộc.'
  })
})

module.exports = {
  createNote,
  editNote
}
