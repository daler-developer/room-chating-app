import { IRoom, IRoomsFilterObj } from '../models'
import client from './client'

class RoomsService {

  async getRooms ({ page, search, sort }: IRoomsFilterObj) {
    const result = await client.get<{ rooms: Array<IRoom>, totalPages: number }>('/api/rooms', {
      params: { page, search, sort }
    }) 

    return result
  }
  
  async joinRoom ({ roomId, password }: { roomId: string, password?: string }) {    
    const result = await client.post<string>(`/api/rooms/${roomId}/participants`, { password }) 
  
    return result
  }

  async leaveRoom({ roomId }: { roomId: string }) {
    const result = await client.delete<string>(`/api/rooms/${roomId}/leave`)

    return result
  }

  async deleteRoom({ roomId, password }: { roomId: string, password: string }) {
    const result = await client.delete<string>(`/api/rooms/${roomId}`, { 
      data: { password }
    })

    return result
  } 
}

export default new RoomsService()
