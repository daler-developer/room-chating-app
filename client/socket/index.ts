import { io, Socket } from 'socket.io-client'

export let socket: Socket = null!

export const initSocket = async () => {
  socket = io('http://localhost:4000', {
    extraHeaders: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
}
