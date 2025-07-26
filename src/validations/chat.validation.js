const joi = require('joi')

const message = joi.object({
  senderId: joi.string().required(),
  content: joi.string().max(2000).allow('', null), 
  images: joi.array().items(joi.string()).default([])
})

module.exports = {
  message
}
