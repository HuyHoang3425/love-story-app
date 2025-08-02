const joi = require('joi')

const { UserConstants } = require('../constants')
const { objectId } = require('./custom.validation')

const createUser = {
  body: joi.object({
    username: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
    firstName: joi.string().optional().allow(''),
    lastName: joi.string().optional().allow(''),
    nickname: joi.string().optional().allow(''),
    gender: joi.string().valid(...Object.values(UserConstants.GENDER)),
    dateOfBirth: joi.date().optional().allow(null),
    avatar: joi.string().optional().allow(''),
    coupleCode: joi.string().optional().allow('')
  })
}

const getUsers = {
  query: joi.object({
    limit: joi.number().integer().min(1).default(10),
    page: joi.number().integer().min(1).default(1)
  })
}

const getUser = {
  params: joi.object({
    userId: joi.string().custom(objectId).required()
  })
}

const updateUser = {
  params: joi.object({
    userId: joi.string().custom(objectId).required()
  }),
  body: joi.object({
    username: joi.string().optional(),
    email: joi.string().email().optional(),
    firstName: joi.string().optional().allow(''),
    lastName: joi.string().optional().allow(''),
    nickname: joi.string().optional().allow(''),
    gender: joi.string().valid(...Object.values(UserConstants.GENDER)),
    dateOfBirth: joi.date().optional().allow(null),
    avatar: joi.string().optional().allow('')
  })
}

const deleteUser = {
  params: joi.object({
    userId: joi.string().custom(objectId).required()
  })
}

const uploadPublicKey = {
  body: joi.object({
    public_key: joi.string().base64({ paddingRequired: false }).required().messages({
      'any.required': 'Public key là bắt buộc.',
      'string.base64': 'Public key phải là chuỗi base64 hợp lệ.'
    })
  })
}
module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadPublicKey
}
