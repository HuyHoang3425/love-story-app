require('dotenv').config()

const env = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase'
  },
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    login: process.env.JWT_EXPIRESIN_LOGIN,
    otp: process.env.JWT_EXPIRESIN_OTP
  }
}

module.exports = env
