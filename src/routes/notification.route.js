const express = require('express')
const NotificationRouter = express.Router()

const { NotificationController } = require('../controllers')
const { auth, authCouple } = require('../middlewares')

NotificationRouter.get('/', auth, authCouple, NotificationController.getNot)

module.exports = NotificationRouter
