const express = require('express')

const userRouter = require('./user.route')
const authRouter = require('./auth.route')
const coupleRouter = require('./couple.route')

const router = express.Router()

router.use('/users', userRouter)

router.use('/auth', authRouter)

router.use('/couple', coupleRouter)

module.exports = router
