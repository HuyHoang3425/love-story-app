const express = require('express')
const authRouter = express.Router()

const { validate,auth } = require('../middlewares')
const { AuthController } = require('../controllers')
const { AuthValidation } = require('../validations/index');

authRouter.post('/register',validate(AuthValidation.register),AuthController.register)

authRouter.post('/confirmOtp', AuthController.confirmOtp)

authRouter.post('/login', validate(AuthValidation.login), AuthController.login)

authRouter.post('/change-password',auth,AuthController.changePassword)

module.exports = authRouter
