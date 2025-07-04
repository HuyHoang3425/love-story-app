const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')
const { StatusCodes } = require('http-status-codes')
const path = require('path')
const cors = require('cors')




const router = require('./routes')
const { response } = require('./utils')
const { errorConverter, errorHandler } = require('./middlewares')
const { env, logger, connectDB, morganMiddleware } = require('./config')


const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('views', `${__dirname}/views`)
app.set('view engine', 'pug')

app.use(express.static(path.join(__dirname, '..', 'public')))

app.use(
  cors({
    origin: '*' // hoặc 'http://localhost:5500' nếu bạn chỉ cho phép 1 trang tĩnh
  })
)

//socketIO
const server = http.createServer(app)
const io = new Server(server)
global.io = io


app.set('trust proxy', true)

if (env.server.nodeEnv === 'development') {
  app.use(morganMiddleware)
  mongoose.set('debug', true)
  logger.info('Running in development mode')
  app.use(morganMiddleware)
  mongoose.set('debug', true)
  logger.info('Running in development mode')
}

app.use('/api/v1', router)
app.use('/api/v1', router)

app.get('/', (req, res) => {
  res.send('Backend Server for Love Story App is running!')
})
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
      environment: env.server.nodeEnv
    })
  )
})

app.all('{/*path}', (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json(response(StatusCodes.NOT_FOUND, 'Không tìm thấy tài nguyên.'))
})
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
    logger.error('Failed to connect to the database:', error)
    process.exit(1)
  })
