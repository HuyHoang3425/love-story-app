const express = require('express')
const petRouter = express.Router()

const { PetValidation } = require('../validations')
const { PetController } = require('../controllers/index')
const { auth, authCouple, validate, loginMission } = require('../middlewares')

petRouter.get('/', auth, authCouple, loginMission, PetController.getPet)

petRouter.patch('/', auth, authCouple, loginMission, validate(PetValidation.editPet), PetController.editPet)

petRouter.post('/', auth, authCouple, loginMission, PetController.feedPet)

module.exports = petRouter
