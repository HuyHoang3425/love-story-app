const mongoose = require('mongoose');
const env = require('./env.config');
const logger = require('./logger.config');

const connectDB = async () => {
  try {
    await mongoose.connect(env.mongo.uri);
    logger.info('Connected to the database');
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
