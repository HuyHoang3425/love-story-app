const express = require('express')
const authRouter = express.Router()

const { validate } = require('../middlewares')
const { AuthController } = require('../controllers')
const { AuthValidation } = require('../validations/index');

authRouter.get("/register",AuthController.ok);
authRouter.post("/register",validate(AuthValidation.register),AuthController.register)

authRouter.post('/confirmOtp', AuthController.comfirmOtp)

module.exports = authRouter
