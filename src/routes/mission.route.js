const express = require('express')
const missionRouter = express.Router()

const { MissionController } = require('../controllers')
const { validate, auth, authAdmin, authCouple, loginMission } = require('../middlewares')
const { MissionValidation } = require('../validations')

missionRouter.get('/', auth, authCouple, loginMission, MissionController.getMissions)

missionRouter.post('/', auth, authAdmin, validate(MissionValidation.createMission), MissionController.createMission)

missionRouter.put(
  '/:missionId',
  auth,
  authAdmin,
  validate(MissionValidation.editMission),
  MissionController.editMission
)

missionRouter.delete('/:missionId/change-active', auth, authAdmin, MissionController.deleteMission)

missionRouter.patch(
  '/:missionId',
  auth,
  authAdmin,
  validate(MissionValidation.changeActiveMision),
  MissionController.changeActiveMision
)

module.exports = missionRouter
