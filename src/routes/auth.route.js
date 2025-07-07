const express = require('express')
const authRouter = express.Router()
const multer = require('multer')

const upload = multer()
const { validate, auth, uploadCloudinary } = require('../middlewares')
const { AuthController } = require('../controllers')
const { AuthValidation } = require('../validations/index')

authRouter.post('/register', validate(AuthValidation.register), AuthController.register)

authRouter.post('/register/confirm-otp', validate(AuthValidation.confirmOtp), AuthController.confirmOtp)

authRouter.post('/send-otp', AuthController.sendOtp)

authRouter.post('/login', validate(AuthValidation.login), AuthController.login)

authRouter.post('/change-password', auth, validate(AuthValidation.changePassword), AuthController.changePassword)

authRouter.post('/forgot-password', validate(AuthValidation.forgotPassword), AuthController.forgotPassword)

authRouter.post('/forgot-password/reset-password', AuthController.resetPassword)

authRouter.get('/profile', auth, AuthController.profile)

authRouter.post(
  '/profile',
  auth,
  validate(AuthValidation.editProfile),
  upload.single('avatar'),
  uploadCloudinary,
  AuthController.editProfile
)

module.exports = authRouter
