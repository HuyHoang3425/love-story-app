const { StatusCodes } = require('http-status-codes')

const { jwt} = require('../utils')
const { ApiError, catchAsync } = require('../utils')
const { User } = require('../models')


const auth = catchAsync( async (req, res,next) => {
  const token = jwt.extractToken(req)
  if (!token) {
    throw new ApiError(StatusCodes.BAD_REQUEST,"vui lòng đăng nhập!")
  }
  const payload = jwt.verifyToken(token);
  const user = await User.findOne({email:email}) 
  if(user){
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'người dùng không tồn tại!')
  }
  req.user = user
  next();
})

module.exports = auth;
