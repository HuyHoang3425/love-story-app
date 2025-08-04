const express = require('express')
const NotificationRouter = express.Router()

const { NotificationController } = require('../controllers')
const { auth, authCouple, validate } = require('../middlewares')
const { NotificationValidation } = require('../validations')

NotificationRouter.get('/', auth, authCouple, NotificationController.getNot)

//khi có couple
// NotificationRouter.post(
//   '/send',
//   auth,
//   authCouple,
//   validate(NotificationValidation.senNot),
//   NotificationController.sendNot
// )

// //sau khi đăng nhập
// NotificationRouter.post(
//   '/fcm-token',
//   auth,
//   validate(NotificationValidation.saveFcmToken),
//   NotificationController.saveFcmToken
// )

module.exports = NotificationRouter
