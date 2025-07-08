const { Pet, User } = require('../models')
const { catchAsync } = require('../utils')

const editPet = catchAsync(async (req, res) => {
  const { name } = req.body
  const user = await User.findById(req.user.id).select('coupleId')
  await Pet.updateOne(
    {
      coupleId: user.coupleId
    },
    {
      name: name
    }
  )
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Đổi tên cho Pet thành công.'))
})

module.exports = {
  editPet
}
