const express = require('express')

const userRouter = require('./user.route')
const authRouter = require('./auth.route')
const coupleRouter = require('./couple.route')
const petRouter = require('./pet.route')
const footRouter = require('./foot.route')

const router = express.Router()

router.use('/users', userRouter)

router.use('/auth', authRouter)

router.use('/couple', coupleRouter)

router.use('/pet', petRouter)

router.use('/food', footRouter)

module.exports = router
