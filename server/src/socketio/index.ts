import { Types } from 'mongoose'
import { Server } from 'socket.io'
import tokensService from '../services/tokensService'
import usersService from '../services/usersService'

export const initSocketIO = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  io.use(async (socket, next) => {
    try {
      const authozation = socket.client.request.headers['authorization'] as string | undefined

      if (authozation) {
        const token = authozation.split(' ')[1]

        if (token) {
          const decoded = tokensService.verifyToken(token) as any

          const user = await usersService.getUserById(new Types.ObjectId(decoded.userId))

          socket.user = user
        }
      }

      next()
    } catch (e) {
      next(new Error('not authenticated'))
    }
  })

  io.on('connection', async (socket) => {
    io.emit(`user.${socket.user._id.toString()}.login`)
    await usersService.setUserOnlineStatus(socket.user._id, true)

    socket.on('disconnect', async () => {
      io.emit(`user.${socket.user._id.toString()}.logout`)

      await usersService.setUserOnlineStatus(socket.user._id, false)
    })
  })
}
