const express = require('express');
const router = express.Router();
const adminRoutes = require('./admin/index');

router.use('/',adminRoutes); 

module.exports = router;
