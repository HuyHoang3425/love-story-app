require('dotenv').config();
const bcrypt = require('bcrypt');
const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10; 

module.exports.hashPassword = async (req, res, next) => {
  const password = req.body.password;
  if (password) {
    const hashed = await bcrypt.hash(password, saltRounds);
    req.body.password = hashed;
  }
  next();
};
