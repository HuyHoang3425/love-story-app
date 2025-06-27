const joi = require('joi')


const register = {
  body: joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    repeatPassword: joi.string().min(6).required()
  })
}

module.exports = {
  register
}
