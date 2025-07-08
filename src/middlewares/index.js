const authCouple = require('./authCouple.middleware')

module.exports = {
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  auth: require('./auth.middleware'),
  authSocket: require('./authSocket.middleware'),
  authCouple: require('./authCouple.middleware'),
  uploadCloudinary: require('./uploadCloud.middleware')
}
