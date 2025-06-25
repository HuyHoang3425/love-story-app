
const express = require('express');
const router = express.Router();
const system = require('../../config/system');
const userRouter = require('./user.routes');

const PATH_ADMIN = system.prefixAdmin;

  router.get(PATH_ADMIN, (req, res) => {
    res.send('Welcome to the Admin API!');
  });

  router.use(PATH_ADMIN + '/user', userRouter);

module.exports = router;
