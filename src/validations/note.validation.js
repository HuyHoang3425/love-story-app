const joi = require('joi')

const { objectId } = require('./custom.validation')

const getNotesQuery = {
  query: joi
    .object({
      year: joi.number().integer().min(2025).max(9999).optional().messages({
        'number.base': 'Năm phải là số.',
        'number.min': 'Năm không hợp lệ.'
      }),
      month: joi.number().integer().min(1).max(12).optional().messages({
        'number.base': 'Tháng phải là số.',
        'number.min': 'Tháng không hợp lệ.',
        'number.max': 'Tháng không hợp lệ.'
      }),
      day: joi.number().integer().min(1).max(31).optional().messages({
        'number.base': 'Ngày phải là số.',
        'number.min': 'Ngày không hợp lệ.',
        'number.max': 'Ngày không hợp lệ.'
      })
    })
    .custom((value, helpers) => {
      const { year, month, day } = value

      const hasDay = !!day
      const hasMonth = !!month
      const hasYear = !!year

      if ((hasDay || hasMonth || hasYear) && !(hasMonth && hasYear)) {
        return helpers.message('Dữ liệu chưa rõ là ngày nào hay tháng nào.')
      }

      return value
    })
}

const createNote = {
  body: joi.object({
    content: joi.string().required().messages({
      'string.empty': 'Nội dung ghi chú không được để trống.',
      'any.required': 'Nội dung ghi chú là bắt buộc.'
    }),
    date: joi.date().required().messages({
      'date.base': 'Ngày không hợp lệ.',
      'any.required': 'Ngày là bắt buộc.'
    })
  })
}

const editNote = {
  params: joi.object({
    noteId: joi.string().custom(objectId).required().messages({
      'string.pattern.base': 'NoteId không hợp lệ.',
      'string.empty': 'NoteId không được để trống.',
      'any.required': 'NoteId là bắt buộc.'
    })
  }),
  body: joi.object({
    content: joi.string().required().messages({
      'string.empty': 'Nội dung ghi chú không được để trống.',
      'any.required': 'Nội dung ghi chú là bắt buộc.'
    })
  })
}
const deleteNote = {
  params: joi.object({
    noteId: joi.string().custom(objectId).required().messages({
      'string.pattern.base': 'NoteId không hợp lệ.',
      'string.empty': 'NoteId không được để trống.',
      'any.required': 'NoteId là bắt buộc.'
    })
  })
}

module.exports = {
  getNotesQuery,
  createNote,
  editNote,
  deleteNote
}
