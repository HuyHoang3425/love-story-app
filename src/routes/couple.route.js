const express = require('express')
const coupleRouter = express.Router()

const {CoupleController} = require('../controllers/index');
const { auth } = require('../middlewares')

coupleRouter.get('/request',auth, CoupleController.request)

// coupleRouter.get('/refuse', CoupleController.request)



module.exports = coupleRouter
