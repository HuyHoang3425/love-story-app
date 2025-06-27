const joi = require('joi')


const register = {
  body: joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    repeatPassword: joi.string().min(6).required()
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
    repeatNewPassword: joi.string().min(6).required()
  })
}

const forgotPassword = {
  body: joi.object({
    email: joi.string().email().required(),
  })
}
module.exports = {
  register,
  login,
  changePassword,
  forgotPassword
}
