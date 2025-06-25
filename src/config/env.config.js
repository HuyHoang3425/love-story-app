require('dotenv').config();

const url = 'mongodb://localhost:27017/mydatabase';
const env = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 3000,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
};

module.exports = env;
