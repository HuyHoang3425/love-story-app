module.exports = {
  ...require('./error.middleware'),
  validate: require('./validate.middleware'),
  auth: require('./auth.middleware'),
  authSocket: require('./authSocket.middleware'),
  authCouple: require('./authCouple.middleware'),
  authAdmin: require('./authAdmin.middleware'),
  uploadCloudinary: require('./uploadCloud.middleware'),
  loginMission: require('./loginMission')
}
