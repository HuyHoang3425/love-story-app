const express = require('express')
const footRouter = express.Router()

const { FoodController } = require('../controllers')
const { FoodValidation } = require('../validations/')
const { auth, authCouple, validate } = require('../middlewares')

footRouter.get('/', auth, authCouple, FoodController.getFood)

footRouter.post('/', auth, authCouple, validate(FoodValidation.createFood), FoodController.createFood)

footRouter.patch('/foodId', auth, authCouple, validate(FoodValidation.editFood), FoodController.editFood)

footRouter.delete('/foodId', auth, authCouple, FoodController.deleteFood)

module.exports = footRouter
