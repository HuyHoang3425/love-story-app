const { StatusCodes } = require('http-status-codes')

const { catchAsync, response, ApiError } = require('../utils')
const { Note } = require('../models')

const getNotes = catchAsync(async (req, res) => {
  const user = req.user
  const notes = await Note.find({
    coupleId: user.coupleId
  })

  if (notes.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Couple chưa có ghi chú nào!!!')
  }
  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy danh sách ghi chú thành công.', {
      notes
    })
  )
})

const createNote = catchAsync(async (req, res) => {
  const { content, date } = req.body
  const user = req.user
  const newNote = await Note.create({
    coupleId: user.coupleId,
    createdBy: user.id,
    content,
    date
  })
  res.status(StatusCodes.CREATED).json(
    response(StatusCodes.CREATED, 'Tạo ghi chú thành công.', {
      newNote
    })
  )
})

const editNote = catchAsync(async (req, res) => {
  const { noteId } = req.params
  const { content } = req.body
  const user = req.user
  const note = await Note.findById(noteId)

  if (!note) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ghi chú không tồn tại.')
  }

  console.log(note.coupleId)
  console.log(user.coupleId)
  if (note.coupleId.toString() !== user.coupleId.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền chỉnh sửa ghi chú này.')
  }

  const update = await Note.findByIdAndUpdate(
    noteId,
    {
      content: content,
      updatedBy: user.id
    },
    {
      new: true
    }
  )
  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Cập nhật ghi chú thành công.', {
      update
    })
  )
})

const deleteNote = catchAsync(async (req, res) => {
  const { noteId } = req.params
  const user = req.user
  const note = await Note.findById(noteId)

  if (!note) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Ghi chú không tồn tại.')
  }

  if (note.coupleId.toString() !== user.coupleId.toString()) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Không có quyền xoá ghi chú này.')
  }

  await Note.deleteOne({ _id: noteId })
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xoá ghi chú thành công.'))
})

module.exports = {
  getNotes,
  createNote,
  editNote,
  deleteNote
}
