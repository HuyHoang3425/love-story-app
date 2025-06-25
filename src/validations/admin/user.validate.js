const httpStatus = require('http-status-codes');
const User = require('../../models/user.model');
const Joi = require('joi');
const ApiError = require('../../utils/ApiError');
const { emailSchema, passwordSchema, nicknameSchema } = require('./schema.validate');

// Tạo user
const createUserPost = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: emailSchema,
      password: passwordSchema,
      nickname: nicknameSchema,
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, message));
    }

    const user = await User.findOne({ email: value.email });
    if (user) {
      return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Người dùng đã tồn tại!'));
    }

    req.body = value;
    next();
  } catch (err) {
    next(err);
  }
};

// Cập nhật user
const updateUserPost = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
      nickname: nicknameSchema.optional(),
    });

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, message));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ApiError(httpStatus.StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng!'));
    }

    if (value.email && value.email !== user.email) {
      const isUser = await User.findOne({ email: value.email });
      if (isUser) {
        return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Email đã tồn tại!'));
      }
    }

    req.body = value;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createUserPost,
  updateUserPost,
};
