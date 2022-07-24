import { IUser } from './types'

declare module 'express' {
  interface Request {
    user?: IUser
  }
}

declare module 'socket.io' {
  interface Socket {
    user: IUser
  }
}
