const { StatusCodes } = require('http-status-codes')

const { User } = require('../models')
const { catchAsync, ApiError, response } = require('../utils')

const createUser = catchAsync(async (req, res) => {
  const { username, email } = req.body

  const isUsernameExists = await User.findOne({ username })
  if (isUsernameExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên người dùng đã được sử dụng.')
  }

  const isEmailExists = await User.findOne({ email })
  if (isEmailExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã được sử dụng.')
  }

  const user = await User.create(req.body)

  res.status(StatusCodes.CREATED).json(response(StatusCodes.CREATED, 'Tạo người dùng thành công.', user))
})

const getUsers = catchAsync(async (req, res) => {
  const { limit = 10, page = 1 } = req.query
  const skip = (+page - 1) * +limit
  const query = {}

  const [users, totalUsers] = await Promise.all([
    User.find(query).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    User.countDocuments(query)
  ])

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy danh sách người dùng thành công.', {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / +limit),
      currentPage: +page
    })
  )
})

const getUser = catchAsync(async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.')
  }

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Lấy thông tin người dùng thành công.', user))
})

const updateUser = catchAsync(async (req, res) => {
  const { userId } = req.params
  const { username, email } = req.body

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.')
  }

  const isUsernameExists = await User.findOne({ username, _id: { $ne: userId } })
  if (isUsernameExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên người dùng đã được sử dụng.')
  }

  const isEmailExists = await User.findOne({ email, _id: { $ne: userId } })
  if (isEmailExists) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email đã được sử dụng.')
  }

  Object.assign(user, req.body)
  await user.save()

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Cập nhật thông tin người dùng thành công.', user))
})

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.')
  }

  await user.deleteOne()
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xoá người dùng thành công.'))
})

const uploadPublicKey = catchAsync(async (req, res) => {
  const user = req.user
  const  { public_key } = req.body
  await User.updateOne({
    _id:user.id
  },{
    public_key,
  })
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Lưu key thành công.'))
})

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  uploadPublicKey,
}
