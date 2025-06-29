const joi = require('joi')

const { UserConstants } = require('../constants')

const register = {
  body: joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    repeatPassword: joi.string().valid(joi.ref('password')).required().messages({
      'any.only': 'Mật khẩu nhập lại không khớp với mật khẩu.'
    })
  })
}

const login = {
  body: joi.object({
    email: joi.string().email().required(),
    password: joi.string().min(6).required()
  })
}

const changePassword = {
  body: joi.object({
    password: joi.string().min(6).required(),
    newPassword: joi.string().min(6).required(),
    repeatNewPassword: joi.string().valid(joi.ref('newPassword')).required().messages({
      'any.only': 'Mật khẩu nhập lại không khớp với mật khẩu mới.'
    })
  })
}

const forgotPassword = {
  body: joi.object({
    email: joi.string().email().required()
  })
}

const editProfile = {
  body: joi.object({
    username: joi.string(),
    firstName: joi.string().optional().allow(''),
    lastName: joi.string().optional().allow(''),
    nickname: joi.string().optional().allow(''),
    gender: joi.string().valid(...Object.values(UserConstants.GENDER)),
    dateOfBirth: joi.date().optional().allow(null),
    avatar: joi.string().optional().allow('')
  })
}

const confirmOtp = {
  body: joi.object({
    otp: joi
      .string()
      .length(4)
      .pattern(/^\d{4}$/)
      .required()
  })
}

module.exports = {
  register,
  login,
  changePassword,
  forgotPassword,
  editProfile,
  confirmOtp,
}
