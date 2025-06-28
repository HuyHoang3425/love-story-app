const express = require('express')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')

const router = require('./routes')
const { response } = require('./utils')
const { errorConverter, errorHandler } = require('./middlewares')
const { env, logger, connectDB, morganMiddleware } = require('./config')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('trust proxy', true)

if (env.server.nodeEnv === 'development') {
  app.use(morganMiddleware)
  mongoose.set('debug', true)
  logger.info('Running in development mode')
}

app.use('/api/v1', router)

app.get('/', (req, res) => {
  res.send('Backend Server for Love Story App is running!')
})

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json(
    response(StatusCodes.OK, 'Server is healthy.', {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.server.nodeEnv
    })
  )
})

app.all('{/*path}', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(response(StatusCodes.NOT_FOUND, 'Không tìm thấy tài nguyên.'))
})

app.use(errorConverter)
app.use(errorHandler)

connectDB()
  .then(() => {
    app.listen(env.server.port, () => {
      logger.info(`Server is running on ${env.server.host}:${env.server.port}`)
    })
  })
  .catch((error) => {
    logger.error('Failed to connect to the database:', error)
    process.exit(1)
  })
