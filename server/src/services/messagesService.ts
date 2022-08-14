import { ObjectId } from 'mongodb'
import collections from '../db/collections'
import {} from '../errors'
import roomsService from './roomsService'
import * as multer from 'multer'
import { IUser } from '../types'

const ITEMS_PER_PAGE = 4

class MessagesService {
  private async queryMessages({ $match = {}, offset = 0, currentUser }: { $match?: object, offset?: number, currentUser: IUser }) {
    return await collections.messages
      .aggregate([
        {
          $match: {
            ...$match,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'creatorId',
            foreignField: '_id',
            as: 'creators',
          }
        },
        {
          $addFields: {
            creator: { $first: '$creators' },
            isCreatedByCurrentUser: { $eq: ['$creatorId', currentUser._id] },
          }
        },
        {
          $unset: ['creators', 'creatorId', 'creator.password']
        },
        {
          $skip: offset
        },
        {
          $limit: ITEMS_PER_PAGE,
        },
      ])
      .toArray()
  }

  async getMessageById({ _id, currentUser }: {_id: ObjectId, currentUser: IUser }) {
    const [message] = await this.queryMessages({ $match: { _id }, currentUser })

    return message
  }

  async createMessage({
    images,
    text,
    currentUser,
    roomId,
  }: {
    images?: { filename: string }[]
    text: string
    currentUser: IUser
    roomId: ObjectId
  }) {
    const { insertedId: messageId } = await collections.messages.insertOne({
      text,
      creatorId: currentUser._id,
      roomId,
      created: new Date(),
      ...Object.assign(
        {},
        images
          ? {
              images: images.map((image) => this.generateImageUrl(image.filename)),
            }
          : {}
      ),
    })

    await roomsService.appendMessage({ roomId, messageId })

    return await this.getMessageById({ currentUser, _id: messageId })
  }

  async getRoomMessages({ roomId, offset, currentUser }: { roomId: ObjectId, offset?: number, currentUser: IUser }) {
    return await this.queryMessages({ $match: {
      roomId
    }, offset, currentUser })
  }

  generateImageUrl(filename: string) {
    return `/uploads/message-images/${filename}`
  }
}

export default new MessagesService()
