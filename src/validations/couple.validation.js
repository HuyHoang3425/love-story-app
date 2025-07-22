const joi = require('joi')

const loveStartedAtEdited = {
  body: joi.object({
    loveStartedAt: joi.date().required().messages({
      'any.required': 'Ngày yêu là bắt buộc.',
      'date.base': 'Ngày yêu không hợp lệ.'
    })
  })
}
module.exports = {
  loveStartedAtEdited
}
