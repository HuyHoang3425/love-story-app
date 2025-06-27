const { StatusCodes } = require('http-status-codes')

const { response } = require('../utils')

const validate = (schema) => (req, res, next) => {
  for (const key in schema) {
    const value = req[key]
    const { error } = schema[key].validate(value, {
      abortEarly: false
    })

    if (error) {
      const { details } = error
      const messages = details.map((detail) => detail.message).join(',')

      return res.status(StatusCodes.BAD_REQUEST).json(response(StatusCodes.BAD_REQUEST, messages))
    }
  }

  next()
}

module.exports = validate
