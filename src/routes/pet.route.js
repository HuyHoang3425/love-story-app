const express = require('express')
const petRouter = express.Router()

const { PetValidation } = require('../validations')
const { PetController } = require('../controllers/index')
const { auth, authCouple, validate } = require('../middlewares')

petRouter.patch('/', auth, authCouple, validate(PetValidation), PetController.editPet)

module.exports = coupleRouter
