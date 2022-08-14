import { IFilterObj as IRoomsFilterObj } from '../pages/rooms'
import { IRoom } from '../types'
import client from './client'

class RoomsService {
  async createRoom({ name, password }: { name: string, password?: string }) {
    const result = await client.post<{
      room: IRoom
    }>('/api/rooms', {
      name, password
    })
  
    return result
  }

  async getRooms({ page, search, access }: IRoomsFilterObj) {
    const result = await client.get<{
      rooms: Array<IRoom>
      totalPages: number
    }>('/api/rooms', {
      params: { page, search, access },
    })

    return result
  }

  async getRoomsUserCreated({ userId }: { userId: string }) {
    const result = await client.get<{ rooms: IRoom[] }>(
      `/api/users/${userId}/rooms/created`
    )

    return result
  }

  async getRoomsUserJoined({ userId }: { userId: string }) {
    const result = await client.get<{ rooms: IRoom[] }>(
      `/api/users/${userId}/rooms/joined`
    )

    return result
  }

  async joinRoom({ roomId, password }: { roomId: string; password?: string }) {
    const result = await client.post<string>(
      `/api/rooms/${roomId}/participants`,
      { password }
    )

    return result
  }

  async leaveRoom({ roomId }: { roomId: string }) {
    const result = await client.delete<string>(`/api/rooms/${roomId}/leave`)

    return result
  }

  async deleteRoom({ roomId, password }: { roomId: string; password: string }) {
    const result = await client.delete<string>(`/api/rooms/${roomId}`, {
      data: { password },
    })

    return result
  }
}

export default new RoomsService()
