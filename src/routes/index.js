const express = require('express')

const userRouter = require('./user.route')
const authRouter = require('./auth.route')
const coupleRouter = require('./couple.route')
const petRouter = require('./pet.route')
const foodRouter = require('./food.route')
const noteRouter = require('./note.route')
const missionRouter = require('./mission.route')
const questionRouter = require('./question.route')

const router = express.Router()

router.use('/users', userRouter)

router.use('/auth', authRouter)

router.use('/couple', coupleRouter)

router.use('/pets', petRouter)

router.use('/foods', foodRouter)

router.use('/notes', noteRouter)

router.use('/mission', missionRouter)

router.use('/question', questionRouter)

module.exports = router
