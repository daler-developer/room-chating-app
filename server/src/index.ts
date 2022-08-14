import { createServer } from 'http'
import * as express from 'express'
import usersRouter from './routers/usersRouter'
import roomsRouter from './routers/roomsRouter'
import messagesRouter from './routers/messagesRouter'
import { initSocketIO } from './socketio'
import validateRequestMiddleware from './middlewares/validateRequestMiddleware'
import * as cookie from 'cookie-parser'
import * as path from 'path'
import client from './db/client'
import * as yup from 'yup'

const app = express()
const httpServer = createServer(app)

app.use(cookie())
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api', usersRouter)
app.use('/api', roomsRouter)
app.use('/api', messagesRouter)

app.use(validateRequestMiddleware)

initSocketIO(httpServer)

const start = async () => {
  await client.connect()

  initSocketIO(httpServer)

  httpServer.listen(4000, () => console.log('listenning'))
}

start()
