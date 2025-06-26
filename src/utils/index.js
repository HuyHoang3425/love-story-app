const { sendMail } = require('./sendMail');

module.exports = {
  catchAsync: require('./catchAsync'),
  ApiError: require('./ApiError'),
  response: require('./response'),
  // sendMail: require('./sendMail')
}
