const { StatusCodes } = require('http-status-codes')

const { ApiError, catchAsync } = require('../utils')

const authAdmin = catchAsync(async (req, res, next) => {
  const role = req.user.role
  if (!role || role != 'admin') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không phải Admin, bạn không có quyền thực hiện.')
  }

  next()
})

module.exports = authAdmin
