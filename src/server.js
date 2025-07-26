const path = require('path')
const cors = require('cors')
const http = require('http')
const axios = require('axios')
const cron = require('node-cron')
const express = require('express')
const mongoose = require('mongoose')
const { StatusCodes } = require('http-status-codes')

const router = require('./routes')
const socket = require('./socket')
const { response } = require('./utils')
const { errorConverter, errorHandler } = require('./middlewares')
const { env, logger, connectDB, morganMiddleware } = require('./config')
const { dailyMission, dailyQuestion, decreasePetHunger } = require('./jobs')
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(
  cors({
    origin: '*'
  })
)

//socketIO
const server = http.createServer(app)
socket.initSocket(server)

app.set('trust proxy', true)

if (env.server.nodeEnv === 'development') {
  app.use(morganMiddleware)
  mongoose.set('debug', true)
  logger.info('Running in development mode')
}

app.use('/api/v1', router)

app.get('/', (req, res) => {
  const VN_TZ = 'Asia/Ho_Chi_Minh'

  const now = dayjs().tz(VN_TZ)
  const startOfTomorrow = now.add(1, 'day').startOf('day')
  const endOfTomorrow = now.add(1, 'day').endOf('day')

  console.log('Thời gian hiện tại (VN):', now.format())
  console.log('Đầu ngày mai (VN):', startOfTomorrow.format())
  console.log('Cuối ngày mai (VN):', endOfTomorrow.format())
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

//reset Question và Mission
cron.schedule(
  '5 0 * * *',
  async () => {
    await Promise.all([
      dailyMission.generateDailyMissionsTomorrow(),
      dailyQuestion.generateDailyQuestionTomorrow(),
      dailyMission.deleteUncompletedMissions(),
      dailyQuestion.deleteUncompletedQuestions()
    ])
  },
  {
    timezone: 'Asia/Ho_Chi_Minh'
  }
)

//Giảm đói Pet
cron.schedule('*/15 * * * *', async () => {
  await decreasePetHunger()
})

app.all('{/*path}', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(response(StatusCodes.NOT_FOUND, 'Không tìm thấy tài nguyên.'))
})

app.use(errorConverter)
app.use(errorHandler)

connectDB()
  .then(() => {
    server.listen(env.server.port, () => {
      logger.info(`Server is running on ${env.server.host}:${env.server.port}`)
    })
  })
  .catch((error) => {
    logger.error('Failed to connect to the database:', error)
    process.exit(1)
  })
