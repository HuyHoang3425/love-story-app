const express = require('express')

const { validate, auth } = require('../middlewares')
const { UserValidation } = require('../validations')
const { UserController } = require('../controllers')

const userRouter = express.Router()

userRouter.post('/', validate(UserValidation.createUser), UserController.createUser)

userRouter.get('/', validate(UserValidation.getUsers), UserController.getUsers)

userRouter.get('/:userId', validate(UserValidation.getUser), UserController.getUser)

userRouter.put('/:userId', validate(UserValidation.updateUser), UserController.updateUser)

userRouter.delete('/:userId', validate(UserValidation.deleteUser), UserController.deleteUser)

userRouter.post('/public-key', auth, validate(UserValidation.uploadPublicKey), UserController.uploadPublicKey)

module.exports = userRouter
