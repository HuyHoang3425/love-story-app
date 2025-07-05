const express = require('express')
const mongoose = require('mongoose')
const cron = require('node-cron')
const axios = require('axios')
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

// Define the /ping route
app.get('/ping', (_req, res) => {
  res.status(200).send('pong')
})

cron.schedule('*/10 * * * *', async () => {
  try {
    const res = await axios.get(`${env.app.url}/ping`)
    logger.info(`[CRON] Ping response: ${res.status} - ${res.data}`)
  } catch (error) {
    logger.error(`[CRON] Ping failed: ${error}`)
  }
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
