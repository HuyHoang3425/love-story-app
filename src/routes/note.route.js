const express = require('express')
const noteRouter = express.Router()

const { NoteController } = require('../controllers')
const { NoteValidation } = require('../validations')
const { auth, authCouple, validate, loginMission } = require('../middlewares')

noteRouter.get('/', auth, authCouple, loginMission, validate(NoteValidation.getNotesQuery), NoteController.getNotes)

noteRouter.post('/', auth, authCouple, loginMission, validate(NoteValidation.createNote), NoteController.createNote)

noteRouter.put('/:noteId', auth, authCouple, loginMission, validate(NoteValidation.editNote), NoteController.editNote)

noteRouter.delete(
  '/:noteId',
  auth,
  authCouple,
  loginMission,
  validate(NoteValidation.deleteNote),
  NoteController.deleteNote
)

module.exports = noteRouter
