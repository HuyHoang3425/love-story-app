const express = require('express')
const noteRouter = express.Router()

const { NoteController } = require('../controllers')
const { NoteValidation } = require('../validations')
const { auth, authCouple, validate } = require('../middlewares')

noteRouter.get('/', auth, authCouple, NoteController.getNotes)

noteRouter.post('/', auth, authCouple, validate({ body: NoteValidation.createNote }), NoteController.createNote)

noteRouter.put('/:noteId', auth, authCouple, validate({ body: NoteValidation.editNote }), NoteController.editNote)

noteRouter.delete('/:noteId', auth, authCouple, NoteController.deleteNote)

module.exports = noteRouter
