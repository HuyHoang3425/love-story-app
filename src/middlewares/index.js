module.exports = {
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  auth: require('./auth.middleware'),
  authSocket: require('./authSocket.middleware'),
  uploadCloudinary: require('./uploadCloud.middleware')
}
