const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/user.controller.js');
const validate = require('../../validations/admin/user.validate.js');
const middleware = require('../../middlewares/hashPassword.middleware.js');
// lấy danh sách user
router.get("/",controller.getUsers);
//tạo ra một user
router.post('/',validate.createUserPost,middleware.hashPassword, controller.createUser);
//cập nhật 1 phần thông tin cho một user
router.patch('/:id',validate.updateUserPost,middleware.hashPassword, controller.updateUserPart);
//cập nhật toàn bộ thông tin cho một user
router.put('/:id',validate.updateUserPost,middleware.hashPassword, controller.updateUserFull);
//xoá user
router.delete('/:id', controller.deleteUser);
//khoá mở tài khoản
router.patch('/change-status/:status/:id', controller.statusUser);


module.exports = router;