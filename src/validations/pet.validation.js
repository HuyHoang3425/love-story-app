const joi = require('joi')

const editPet = {
  body: joi.object({
    name: joi.string().trim().min(1).max(50).required().messages({
      'string.empty': 'Tên không được để trống',
      'string.min': 'Tên quá ngắn',
      'string.max': 'Tên quá dài',
      'any.required': 'Vui lòng nhập tên thú cưng'
    })
  })
}

module.exports = {
  editPet
}
