const { StatusCodes } = require('http-status-codes')

const { getIO } = require('../socket')
const feedPetHandel = require('../socket/handlers/feedPet.handle')
const { catchAsync, response, ApiError } = require('../utils')
const { Pet, User, Couple, Food, FeedingLog } = require('../models')
const { Socket } = require('socket.io')


const getPet = catchAsync(async (req, res) => {
  const pet = await Pet.findOne({ coupleId: req.user.coupleId })
  if (!pet) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy pet!')
  }

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy thông tin Pet thành công.', {
      pet
    })
  )
})
const editPet = catchAsync(async (req, res) => {
  const { name } = req.body
  const user = await User.findById(req.user.id).select('coupleId')
  const pet = await Pet.findOneAndUpdate(
    {
      coupleId: user.coupleId
    },
    {
      name: name
    },
    { new: true }
  )
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đổi tên cho Pet thành công.', { pet }))
})

const feedPet = catchAsync(async (req, res) => {
  const io = getIO()
  const user = req.user
  const { foodId } = req.body
  const couple = await Couple.findById(user.coupleId)

  const pet = await Pet.findOne({ coupleId: user.coupleId })
  if (!pet) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Pet không tồn tại.')
  }

  const food = await Food.findById(foodId)
  if (!food) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Thức ăn không hợp lệ.')
  }

  if (pet.hunger == 100) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Pet của bạn đã no.')
  }

  if (couple.coin < food.price) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Bạn không có đủ tiền.')
  }
  couple.coin -= food.price
  await couple.save()

  pet.hunger = Math.min(pet.hunger + food.nutritionValue, 100)
  pet.happiness = Math.min(pet.happiness + food.happinessValue, 100)
  pet.lastFedAt = new Date()
  await pet.save()

  await FeedingLog.create({
    coupleId: user.coupleId,
    petId: pet.id,
    foodId: food.id,
    fedBy: user.id,
    fedAt: new Date(),
    value: food.nutritionValue
  })

  const receiverId = couple.userIdB == user.id ? couple.userIdA : couple.userIdB
  const data = {
    coin:couple.coin,
    hunger:pet.hunger,
    happiness:pet.happiness 
  }
  feedPetHandel(io,receiverId,data)

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Cho Pet ăn thành công.', { pet }))
})
module.exports = {
  getPet,
  editPet,
  feedPet
}
