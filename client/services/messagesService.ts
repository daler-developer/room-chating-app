import { IRoom } from "../types"
import client from "./client"

export interface ICreateMessageData {
  roomId: string
  images: FileList | null
  text: string
}

class MessagesService {
  async createMessage ({ roomId, text, images }: ICreateMessageData) {
    const form = new FormData()

    form.append('text', text)

    if (images) {
      [...images].forEach((image) => {
        form.append('images', image)
      })
    }

    return client.post(`/api/rooms/${roomId}/messages`, form)
  }

  async fetchRoomMessages ({ roomId, offset }: { roomId: string, offset: number }) {
    return await client.get<{ rooms: IRoom[] }>(`/api/rooms/${roomId}/messages`, {
      params: { offset }
    })
  }
}

export default new MessagesService()
