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
    secret_login: process.env.JWT_SECRET_LOGIN,
    secret_otp: process.env.JWT_SECRET_OTP,
    login: process.env.JWT_EXPIRESIN_LOGIN,
    otp: process.env.JWT_EXPIRESIN_OTP
  },
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_setcret: process.env.API_SECRET
  }
}

module.exports = env
