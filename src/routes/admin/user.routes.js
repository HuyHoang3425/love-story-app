const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/user.controller.js');
const validate = require('../../validations/admin/user.validate.js');

// lấy danh sách user
router.get("/",controller.getUsers);
//tạo ra một user
router.post('/create',validate.createUserPost, controller.createUser);
//cập nhật cho một user
router.patch('/update/:id',validate.updateUserPost, controller.updateUser);
//xoá user
router.delete('/delete/:id', controller.deleteUser);
//khoá mở tài khoản
router.patch('/change-status/:status/:id', controller.statusUser);


module.exports = router;