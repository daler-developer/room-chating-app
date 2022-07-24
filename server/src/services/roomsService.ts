import { ObjectId } from 'mongodb'
import collections from '../db/collections'
import { IncorrectPasswordError } from '../errors'
import { IUser } from '../types'

const ITEMS_PER_PAGE = 4

export interface IFitlerObj {
  page?: number
  search?: string
  sort?: 'all' | 'public' | 'private'
}

class RoomsService {

  private async queryRooms({ currentUser, $match, page = 1, unsetPassword = true }: { unsetPassword?: boolean, currentUser: IUser, $match: object, page?: number }) {
    return await collections.rooms.aggregate([
      {
        $match: {
          ...$match
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creatorId',
          foreignField: '_id',
          as: 'creators'
        }
      },
      {
        $addFields: {
          creator: { $first: '$creators' },
          isCurrentUserJoined: { $in: [currentUser._id, '$participants_ids'] },
          totalNumParticipants: { $size: '$participants_ids' },
          participants_ids: { $slice: ['$participants_ids', 2] },
          isCreatedByCurrentUser: { $eq: ['$creatorId', currentUser._id] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'participants_ids',
          foreignField: '_id',
          as: 'participants'
        }
      },
      {
        $unset: ['creators', 'creatorId', 'creator.password', 'participants_ids', ...(unsetPassword ? ['password'] : []),]
      },
      {
        $skip: (page - 1) * ITEMS_PER_PAGE
      },
      {
        $limit: ITEMS_PER_PAGE
      }
    ]).toArray()
  }

  async getRoomById({ roomId, currentUser, unsetPassword = true }: { unsetPassword?: boolean, roomId: ObjectId, currentUser: IUser }) {
    const [room] = await this.queryRooms({ currentUser, $match: { _id: roomId }, unsetPassword })

    return room
  }

  async roomWithPasswordExists ({ _id, currentUser }: { _id: ObjectId, currentUser: IUser }) {
    const [room] = await this.queryRooms({ $match: { _id }, currentUser })

    return room
  }

  async createRoom ({ name, isPrivate, password, creatorId, currentUser }: { currentUser: IUser, name: string, isPrivate: boolean, password?: string, creatorId: ObjectId }) {
    const data = {
      name,
      isPrivate,
      creatorId,
      participants_ids: [],
      messages_ids: []
    } as any

    if (isPrivate) {
      data.password = password
    }

    const { insertedId: roomId } = await collections.rooms.insertOne(data) 
    
    return await this.getRoomById({ currentUser, roomId })
  }

  async getRooms ({ currentUser, page, search, sort }: IFitlerObj & { currentUser: IUser }) {
    const $match = {} as any

    if (search) {
      $match.name = { $regex: new RegExp(search, 'i') }
    }
    
    if (sort === 'public') {
      $match.isPrivate = false
    }
    
    if (sort === 'private') {
      $match.isPrivate = true
    }

    return await this.queryRooms({ currentUser, $match, page })
  }

  async addRoomParticipant({ roomId, userId, password, currentUser }: { currentUser: IUser, roomId: ObjectId, userId: ObjectId, password?: string }) {
    const room = await this.getRoomById({ roomId, currentUser, unsetPassword: false })
    
    if (room.isPrivate) {
      if (room.password === password) {
        await collections.rooms.updateMany({ _id: roomId }, {
          $push: { participants_ids: userId as any }
        })
      } else {
        throw new IncorrectPasswordError()
      }
    } else {
      await collections.rooms.updateMany({ _id: roomId }, {
        $push: { participants_ids: userId as any }
      })
    }
  }

  async removeRoomParticipant({ roomId, userId }: { roomId: ObjectId, userId: ObjectId }) {
    await collections.rooms.updateOne({ _id: roomId }, { $pull: { participants_ids: userId } })
  }

  async getTotalRoomsPages ({ search, sort }: { search?: string, sort?: IFitlerObj['sort'] }) {
    let totalPages = 0

    const $match = {} as any

    if (search) {
      $match.name = { $regex: new RegExp(search, 'i') }
    }
    
    if (sort === 'public') {
      $match.isPrivate = false
    }
    
    if (sort === 'private') {
      $match.isPrivate = true
    }

    const totalDocuments = await collections.rooms.countDocuments($match) as any

    totalPages += Math.floor(totalDocuments / ITEMS_PER_PAGE)

    if (totalDocuments % ITEMS_PER_PAGE !== 0) {
      totalPages++
    }

    return totalPages
  }

  async appendMessage({ roomId, messageId }: { roomId: ObjectId, messageId: ObjectId }) {
    await collections.rooms.updateOne({ _id: roomId }, { $push: { messages_ids: messageId } })
  }

  async deleteRoom({ roomId }: { roomId: ObjectId }) {
    await collections.rooms.deleteOne({ _id: roomId })
  }

}

export default new RoomsService()
