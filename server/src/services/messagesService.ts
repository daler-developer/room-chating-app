import { ObjectId } from 'mongodb'
import collections from '../db/collections'
import { } from '../errors'
import roomsService from './roomsService'
import * as multer from 'multer'

const ITEMS_PER_PAGE = 4

class MessagesService {

  private async queryMessages({ $match = {} }: { $match?: object }) {
    return await collections.messages.aggregate([
      {
        $match: {
          ...$match
        }
      },
      {
        $limit: ITEMS_PER_PAGE
      }
    ]).toArray()
  }

  async getMessageById(_id: ObjectId) {
    const [message] = await this.queryMessages({ $match: { _id }}) 

    return message
  }

  async createMessage({ images, text, creatorId, roomId }: { images?: { filename: string }[], text: string, creatorId: ObjectId, roomId: ObjectId }) {
    const { insertedId: messageId } = await collections.messages.insertOne({
      text,
      creatorId,
      created: new Date(),
      ...Object.assign({}, images ? { images: images.map((image) => this.generateImageUrl(image.filename)) } : {})
    })

    await roomsService.appendMessage({ roomId, messageId })

    return await this.getMessageById(messageId)
  }

  generateImageUrl(filename: string) {
    return `/uploads/message-images/${filename}`
  }
}

export default new MessagesService()

