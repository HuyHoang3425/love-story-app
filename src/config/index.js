module.exports = {
  env: require('./env.config'),
  connectDB: require('./db.config'),
  logger: require('./logger.config'),
  morganMiddleware: require('./morgan.config'),
};
