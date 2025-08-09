const joi = require('joi')

const message = joi.object({
  senderId: joi.string(),
  toUserId: joi.string().required(),
  coupleId: joi.string().required(),
  content: joi.string().max(2000).allow('', null),
  images: joi.array(),
})

module.exports = {
  message
}
