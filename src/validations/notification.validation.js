const joi = require('joi')

const senNot = {
  body: joi.object({
    token: joi.string().required().messages({
      'any.required': 'Thiếu token người nhận',
      'string.base': 'token phải là chuỗi'
    }),
    title: joi.string().required().messages({
      'any.required': 'Tiêu đề không được để trống'
    }),
    content: joi.string().required().messages({
      'any.required': 'Nội dung không được để trống'
    })
  })
}

const saveFcmToken = {
  body: joi.object({
    userId: joi.string().required().messages({
      'any.required': 'userId là bắt buộc',
      'string.base': 'userId phải là chuỗi'
    }),
    fcmToken: joi.string().required().messages({
      'any.required': 'fcmToken là bắt buộc',
      'string.base': 'fcmToken phải là chuỗi'
    })
  })
}
module.exports = {
  senNot,
  saveFcmToken
}
