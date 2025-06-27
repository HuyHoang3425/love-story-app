const express = require('express')
const authRouter = express.Router()

const { validate,auth } = require('../middlewares')
const { AuthController } = require('../controllers')
const { AuthValidation } = require('../validations/index');

authRouter.post('/register',validate(AuthValidation.register),AuthController.register)

authRouter.post('/register/confirm-otp', AuthController.confirmOtpRegister)

authRouter.post('/login', validate(AuthValidation.login), AuthController.login)

authRouter.post('/change-password',auth,validate(AuthValidation.changePassword),AuthController.changePassword)

authRouter.post('/forgot-password',validate(AuthValidation.forgotPassword),AuthController.forgotPassword)

authRouter.post('/forgot-password/confirm-otp', AuthController.confirmOtpForgotPassword)


module.exports = authRouter
