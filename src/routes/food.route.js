const express = require('express')
const footRouter = express.Router()
const multer = require('multer')

const upload = multer()
const { FoodController } = require('../controllers')
const { FoodValidation } = require('../validations')
const { auth, authCouple, validate, authAdmin, uploadCloudinary } = require('../middlewares')

footRouter.get('/', auth, authCouple, FoodController.getFood)

footRouter.post(
  '/',
  auth,
  authAdmin,
  validate(FoodValidation.createFood),
  upload.single('image'),
  uploadCloudinary,
  FoodController.createFood
)

footRouter.patch(
  '/:foodId',
  auth,
  authAdmin,
  validate(FoodValidation.editFood),
  upload.single('image'),
  uploadCloudinary,
  FoodController.editFood
)

footRouter.delete('/:foodId', auth, authAdmin,validate(FoodValidation.deleteFoot), FoodController.deleteFood)

module.exports = footRouter
