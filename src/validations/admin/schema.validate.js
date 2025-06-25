const Joi = require('joi');
// Email
const emailSchema = Joi.string().email().required().messages({
  'string.base': 'Email phải là một chuỗi',
  'string.empty': 'Email không được để trống',
  'string.email': 'Email không hợp lệ',
  'any.required': 'Email là bắt buộc',
});

// Password
const passwordSchema = Joi.string().min(6).max(20).required().messages({
  'string.base': 'Mật khẩu phải là một chuỗi',
  'string.empty': 'Mật khẩu không được để trống',
  'string.min': 'Mật khẩu phải có ít nhất {#limit} ký tự',
  'string.max': 'Mật khẩu không được vượt quá {#limit} ký tự',
  'any.required': 'Mật khẩu là bắt buộc',
});

// Nickname
const nicknameSchema = Joi.string().min(2).max(30).required().messages({
  'string.base': 'Tên không hợp lệ',
  'string.empty': 'Tên không được để trống',
  'string.min': 'Tên phải có ít nhất {#limit} ký tự',
  'string.max': 'Tên không được vượt quá {#limit} ký tự',
  'any.required': 'Tên là bắt buộc',
});

module.exports = {
  emailSchema,
  passwordSchema,
  nicknameSchema,
}