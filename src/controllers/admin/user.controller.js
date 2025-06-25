const httpStatus = require('http-status-codes');
const ApiError = require('../../utils/ApiError');
const catchAsync = require('../../utils/catchAsync');
const User = require('../../models/user.model');
const md5 = require('md5');
const paginationHelper = require('../../helper/pagination');
const { customAlphabet } = require('nanoid');;

//[GET] admin/user
const getUsers = catchAsync(async (req, res) => {
  // [GET] /admin/user?page=2(phân trang)
  const page = req.query.page;
  const limit = req.query.limit;
  const total = await User.countDocuments();
  let objectPagination = paginationHelper(
    {
      currentPage: 1,
      limit:5,
    },
    req.query,
    total,
  );
  const users = await User.find().limit(objectPagination.limit).skip(objectPagination.skip);

  if (users.length === 0) {
    throw new ApiError(httpStatus.StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  res.status(httpStatus.StatusCodes.OK).json({
    message: 'Lấy danh sách người dùng thành công',
    data: users,
    pagination:objectPagination,
  });
});
//[POST] admin/user
const createUser = catchAsync(async (req, res) => {
  const { email, password, nickname } = req.body;

  const coupleCode = customAlphabet('1234567890',6);

  const user = await User.create({
    email,
    password,
    nickname,
    coupleCode: coupleCode(),
  });

  res.status(httpStatus.StatusCodes.CREATED).json({
    message: 'Tạo người dùng thành công',
    data: user,
  });
});

//[PATCH] admin/user/:id
const updateUserPart = catchAsync(async (req, res) => {
  const { email, password, nickname } = req.body;
  const id = req.params.id;
  const user = await User.findOne({ _id: id });

  await User.updateOne(
    {
      _id: user.id,
    },
    {
      email: email || user.email,
      password:password || user.password,
      nickname: nickname || user.nickname,
    },
  );

  const updatedUser = await User.findById(id);
  res.status(httpStatus.StatusCodes.OK).json({
    message: 'Cập nhật người dùng thành công',
    data: updatedUser,
  });
});

//[PATCH] admin/user/:id
const updateUserFull = catchAsync(async (req, res) => {
  const { email, password, nickname } = req.body;
  const id = req.params.id;

  await User.updateOne(
    {
      _id: id,
    },
    {
      email,
      password,
      nickname,
    },
  );

  const updatedUser = await User.findById(id);
  res.status(httpStatus.StatusCodes.OK).json({
    message: 'Cập nhật người dùng thành công',
    data: updatedUser,
  });
});

//[DELETE] admin/user/:id
const deleteUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  const user = await User.findOne({ _id: id });
  if (!user) {
    throw new ApiError(httpStatus.StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  await User.deleteOne({
    _id: user.id,
  });

  res.status(httpStatus.StatusCodes.OK).json({
    message: 'Xoá người dùng thành công',
  });
});

// [PATCH] admin/user/change-status/:status/:id
const statusUser = catchAsync(async (req, res) => {
  const { id, status } = req.params;

  if (!['active', 'inactive', 'blocked'].includes(status)) {
    throw new ApiError(httpStatus.StatusCodes.BAD_REQUEST, 'Trạng thái không hợp lệ');
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng');
  }

  await User.updateOne({ _id: id }, { status });

  const updatedUser = await User.findById(id);

  res.status(httpStatus.StatusCodes.OK).json({
    message:
      status === 'active'
        ? 'Mở tài khoản người dùng thành công'
        : status === 'inactive'
        ? 'Khóa tạm thời tài khoản người dùng thành công'
        : 'Khoá tài khoản người dùng thành công',
    data: updatedUser,
  });
});

module.exports = {
  getUsers,
  createUser,
  updateUserPart,
  updateUserFull,
  deleteUser,
  statusUser,
};
