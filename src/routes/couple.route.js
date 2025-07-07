const express = require('express')
const coupleRouter = express.Router()

const { CoupleController } = require('../controllers/index')
const { auth } = require('../middlewares')

coupleRouter.get('/connect', auth, CoupleController.request)

module.exports = coupleRouter
