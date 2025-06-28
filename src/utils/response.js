const response = (statusCode, message, data = null) => {
  return {
    statusCode,
    message,
    ...(data !== null ? { data } : {})
  }
}

module.exports = response
