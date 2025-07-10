const { StatusCodes } = require('http-status-codes')
const { Food } = require('../models')

const { catchAsync, response, ApiError } = require('../utils')

const getFood = catchAsync(async (req, res) => {
  const { limit = 10, page = 1 } = req.query
  const skip = (+page - 1) * +limit
  const query = {}

  const [foods, totalFoods] = await Promise.all([
    Food.find(query).skip(skip).limit(+limit).sort({ createdAt: -1 }),
    Food.countDocuments(query)
  ])

  return res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy danh sách món ăn thành công.', {
      foods,
      totalFoods,
      totalPages: Math.ceil(totalFoods / +limit),
      currentPage: +page
    })
  )
})

const createFood = catchAsync(async (req, res) => {
  const { name } = req.body
  const existing = await Food.findOne({ name })
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên món ăn đã tồn tại.')
  }

  const newFood = await Food.create(req.body)
  return res.status(StatusCodes.CREATED).json(response(StatusCodes.CREATED, 'Tạo món ăn thành công.', { newFood }))
})

const editFood = catchAsync(async (req, res) => {
  const { foodId } = req.params
  const food = await Food.findById(foodId)
  if (!food) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy món ăn.')
  }

  if (req.body.name) {
    const conflict = await Food.findOne({ name: req.body.name, _id: { $ne: foodId } })
    if (conflict) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên món ăn đã tồn tại.')
    }
  }

  const updated = await Food.findByIdAndUpdate(foodId, req.body, { new: true })
  return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Cập nhật món ăn thành công.', { updated }))
})

const deleteFood = catchAsync(async (req, res) => {
  const { foodId } = req.params

  const food = await Food.findById(foodId)
  if (!food) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Món ăn không tồn tại.')
  }

  await Food.findByIdAndDelete(foodId)
  return res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xoá món ăn thành công.'))
})

module.exports = {
  getFood,
  createFood,
  editFood,
  deleteFood
}
