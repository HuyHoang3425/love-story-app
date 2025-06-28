const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')

const { ApiError } = require('../utils')
const { env, logger } = require('../config')

const errorConverter = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? StatusCodes.BAD_REQUEST : StatusCodes.INTERNAL_SERVER_ERROR
    const message = error.message || StatusCodes[statusCode]
    error = new ApiError(statusCode, message, false, err.stack)
  }

  next(error)
}

const errorHandler = async (err, req, res, next) => {
  let { statusCode, message } = err

  if (env.nodeEnv === 'production' && !err.isOperational) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    message = 'Server xảy ra lỗi, vui lòng thử lại sau.'
  }

  res.locals.errorMessage = err.message

  const response = {
    statusCode,
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack })
  }

  if (env.nodeEnv === 'development') {
    logger.error(err)
  }

  res.status(statusCode).send(response)
}

module.exports = {
  errorHandler,
  errorConverter
}
