const joi = require('joi')

const createMission = {
  body: joi.object({
    description: joi.string().trim().required().messages({
      'string.empty': 'Mô tả nhiệm vụ không được để trống.',
      'any.required': 'Mô tả nhiệm vụ là bắt buộc.'
    }),
    coin: joi.number().min(0).required().messages({
      'number.base': 'Coin phải là một số.',
      'number.min': 'Coin không được âm.',
      'any.required': 'Coin là bắt buộc.'
    }),
    isShared: joi.boolean().required().messages({
      'boolean.base': 'isShared phải là true hoặc false.',
      'any.required': 'Phân loại nhiệm vụ là bắt buộc.'
    })
  })
}

const editMission = {
  body: joi.object({
    description: joi.string().trim().optional().messages({
      'string.empty': 'Mô tả nhiệm vụ không được để trống.'
    }),
    coin: joi.number().min(0).optional().messages({
      'number.base': 'Coin phải là một số.',
      'number.min': 'Coin không được âm.'
    }),
    isShared: joi.boolean().optional().messages({
      'boolean.base': 'isShared phải là true hoặc false.'
    })
  })
}

const changeActiveMision = {
  body: joi.object({
    isActive: joi.boolean().required().messages({
      'any.required': 'Trường isActive là bắt buộc.',
      'boolean.base': 'Trường isActive phải là true hoặc false.'
    })
  })
}
module.exports = {
  createMission,
  editMission,
  changeActiveMision
}
