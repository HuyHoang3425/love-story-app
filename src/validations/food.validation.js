const joi = require('joi')

const createFood = {
  body: joi.object({
    name: joi.string().trim().min(1).max(100).required().messages({
      'string.empty': 'Tên món ăn không được để trống.',
      'string.min': 'Tên món ăn quá ngắn.',
      'string.max': 'Tên món ăn quá dài.',
      'any.required': 'Vui lòng nhập tên món ăn.'
    }),
    image: joi.string().optional().default('example.png'),
    price: joi.number().min(0).required().messages({
      'number.base': 'Giá phải là số.',
      'number.min': 'Giá không thể âm.',
      'any.required': 'Vui lòng nhập giá.'
    }),
    nutritionValue: joi.number().min(0).max(100).required().messages({
      'number.base': 'Giá trị dinh dưỡng phải là số.',
      'number.min': 'Không thể âm.',
      'number.max': 'Không vượt quá 100%.',
      'any.required': 'Vui lòng nhập giá trị dinh dưỡng.'
    }),
    happinessValue: joi.number().min(0).max(100).required().messages({
      'number.base': 'Giá trị hạnh phúc phải là số.',
      'number.min': 'Không thể âm.',
      'number.max': 'Không vượt quá 100%.',
      'any.required': 'Vui lòng nhập giá trị hạnh phúc.'
    })
  })
}

const editFood = {
  body: joi
    .object({
      name: joi.string().trim().min(1).max(100).optional(),
      image: joi.string().optional(),
      price: joi.number().min(0).optional(),
      nutritionValue: joi.number().min(0).max(100).optional(),
      happinessValue: joi.number().min(0).max(100).optional()
    })
    .min(1)
    .messages({
      'object.min': 'Phải có ít nhất 1 trường để cập nhật.'
    })
}

module.exports = {
  createFood,
  editFood
}
