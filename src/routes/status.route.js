const express = require('express')
const statusRouter = express.Router()

const { StatusController } = require('../controllers/index')
const { auth, authCouple } = require('../middlewares')

statusRouter.get('/daily', auth, authCouple, StatusController.getDailyStatus)

module.exports = statusRouter
