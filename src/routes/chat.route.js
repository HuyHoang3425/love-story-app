const express = require('express')
const chatRouter = express.Router()

const { auth, authCouple } = require('../middlewares')
const { ChatController } = require('../controllers')

chatRouter.get('/:roomChatId', auth, authCouple, ChatController.getMessages)

module.exports = chatRouter
