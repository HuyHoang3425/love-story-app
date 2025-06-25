const httpStatus = require('http-status-codes');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/user.model');

const createUserPost = async (req, res, next) => {
  const { email, password, nickname } = req.body;

  const user = await User.findOne({
    email:email,
  })
  if (!email) {
    return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Vui lòng nhập Email!'));
  }
  if (!password) {
    return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Vui lòng nhập Password!'));
  }
  if (!nickname) {
    return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Vui lòng nhập Nickname!'));
  }
  if(user){
    return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Người dùng đã tồn tại!'));
  }

  next(); 
};


const updateUserPost = async (req, res, next) => {
  const { email } = req.body;
  const id = req.params.id;
  const user = await User.findOne({
    _id:id,
  });
  if (!user) {
    return next(new ApiError(httpStatus.StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng!'));
  }
  if(email && email != user.email){
    const isUser = await User.findOne({
      email:email,
    });
    if(isUser){
      return next(new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Email đã tồn tại!'));
    }
  }
  next();
};

module.exports = {
  createUserPost,
  updateUserPost,
};