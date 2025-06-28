module.exports = {
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  auth: require('./auth.middleware'),
  uploadCloudinary: require('./uploadCloud.middleware')
}
