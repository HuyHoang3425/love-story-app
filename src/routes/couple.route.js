const express = require('express')
const coupleRouter = express.Router()

const { CoupleController } = require('../controllers/index')
const { auth, validate, authCouple } = require('../middlewares')
const { CoupleValidation } = require('../validations')

coupleRouter.get('/connect', auth, CoupleController.connect)

coupleRouter.delete('/disconnect', auth, authCouple, CoupleController.disconnect)

coupleRouter.get('/', auth, authCouple, CoupleController.getInfoCouple)

coupleRouter.patch(
  '/',
  auth,
  authCouple,
  validate(CoupleValidation.loveStartedAtEdited),
  CoupleController.editLoveStarted
)

module.exports = coupleRouter
