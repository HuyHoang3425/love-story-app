const express = require('express')
const noteRouter = express.Router()

const { NoteController } = require('../controllers')
const { NoteValidation } = require('../validations')
const { auth, authCouple, validate } = require('../middlewares')

noteRouter.get('/', auth, authCouple, validate(NoteValidation.getNotesQuery), NoteController.getNotes)

noteRouter.post('/', auth, authCouple, validate(NoteValidation.createNote), NoteController.createNote)

noteRouter.put('/:noteId', auth, authCouple, validate(NoteValidation.editNote), NoteController.editNote)

noteRouter.delete('/:noteId', auth, authCouple, validate(NoteValidation.deleteNote), NoteController.deleteNote)

module.exports = noteRouter
