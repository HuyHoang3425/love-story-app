const { StatusCodes } = require('http-status-codes')

const { catchAsync, response, ApiError } = require('../utils')
const { Note } = require('../models')

const getNotes = catchAsync(async (req, res) => {
  const { day, month, year } = req.query
  const coupleId = req.user.coupleId

  let filter = { coupleId }
  let message = 'Lấy danh sách ghi chú thành công.'

  if (year && month) {
    const start = new Date(year, month - 1, day || 1)
    const end = day ? new Date(year, month - 1, Number(day) + 1) : new Date(year, month, 1)

    filter.date = { $gte: start, $lt: end }
    message = day ? 'Lấy danh sách ghi chú theo ngày thành công.' : 'Lấy danh sách ghi chú theo tháng thành công.'
  }

  const notes = await Note.find(filter)

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, message, { notes }))
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
