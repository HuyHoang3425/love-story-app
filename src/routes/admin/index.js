const express = require('express');
const system = require('../../config/system');
const userRouter = require('./user.routes');

const PATH_ADMIN = system.prefixAdmin;

module.exports = (app) => {
  app.get(PATH_ADMIN, (req, res) => {
    res.send('Welcome to the Admin API!');
  });

  app.use(PATH_ADMIN + '/user', userRouter);
};
