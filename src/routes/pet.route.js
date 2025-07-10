const express = require('express')
const petRouter = express.Router()

const { PetValidation } = require('../validations')
const { PetController } = require('../controllers/index')
const { auth, authCouple, validate } = require('../middlewares')

petRouter.get('/', auth, authCouple, PetController.getPet)

petRouter.patch('/', auth, authCouple, validate(PetValidation.editPet), PetController.editPet)

petRouter.post('/', auth, authCouple, PetController.feedPet)

module.exports = petRouter
