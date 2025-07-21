const { StatusCodes } = require('http-status-codes')

const { catchAsync, response, ApiError } = require('../utils')
const { CoupleMissionLog, Mission } = require('../models')

const getMissions = catchAsync(async (req, res) => {
  const missions = await CoupleMissionLog.find({}).populate({
    path: 'missionId',
    match: { isActive: true },
    select: 'isActive description'
  })

  if (missions.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Danh sách nhiệm vụ trống.')
  }

  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Lấy danh sách nhiệm vụ thành công.', {
      missions: missions
    })
  )
})

const createMission = catchAsync(async (req, res) => {
  const { description, coin, isShared } = req.body

  const newMission = await Mission.create({
    description,
    coin,
    isShared
  })

  res.status(StatusCodes.CREATED).json(response(StatusCodes.CREATED, 'Tạo nhiệm vụ thành công.', { newMission }))
})

const editMission = catchAsync(async (req, res) => {
  const { description, coin, isShared } = req.body
  const { missionId } = req.params

  const mission = await Mission.findById(missionId)
  if (!mission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Nhiệm vụ không tồn tại.')
  }

  mission.description = description
  mission.coin = coin
  mission.isShared = isShared
  await mission.save()

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Cập nhật nhiệm vụ thành công.', { mission }))
})

const deleteMission = catchAsync(async (req, res) => {
  const { missionId } = req.params

  const mission = await Mission.findById(missionId)
  if (!mission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Nhiệm vụ không tồn tại.')
  }

  await Mission.deleteOne({ _id: missionId })
  res.status(StatusCodes.OK).json(response(StatusCodes.OK, 'Xoá nhiệm vụ thành công.'))
})

const changeActiveMision = catchAsync(async (req, res) => {
  const { missionId } = req.params
  const { isActive } = req.body

  const mission = await Mission.findById(missionId)
  if (!mission) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Nhiệm vụ không tồn tại.')
  }

  mission.isActive = isActive
  await mission.save()

  const message = isActive ? 'Kích hoạt nhiệm vụ thành công.' : 'Vô hiệu hoá nhiệm vụ thành công.'

  res.status(StatusCodes.OK).json(response(StatusCodes.OK, message, { mission }))
})

module.exports = {
  getMissions,
  createMission,
  editMission,
  deleteMission,
  changeActiveMision
}
