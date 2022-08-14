import { ObjectId } from 'mongodb'
import collections from '../db/collections'
import { IncorrectPasswordError } from '../errors'
import { IUser } from '../types'

const ITEMS_PER_PAGE = 4

export interface IFitlerObj {
  page?: number
  search?: string
  access?: 'all' | 'public' | 'private'
}

class RoomsService {
  private async queryRooms({
    currentUser,
    $match,
    page = 1,
    participantsOffset = 1,
    unsetPassword = true,
    populateParticipants = false,
  }: {
    unsetPassword?: boolean
    currentUser: IUser
    $match: object
    page?: number
    participantsOffset?: number
    populateParticipants?: boolean
  }) {
    return await collections.rooms
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
          },
        },
        {
          $addFields: {
            creator: { $first: '$creators' },
            isCurrentUserJoined: {
              $in: [currentUser._id, '$participants_ids'],
            },
            totalNumParticipants: { $size: '$participants_ids' },
            participants_ids: { $slice: ['$participants_ids', participantsOffset, 2] },
            isCreatedByCurrentUser: { $eq: ['$creatorId', currentUser._id] },
            isPrivate: { $and: ['$password'] },
          },
        },
        ...(populateParticipants
          ? [
              {
                $lookup: {
                  from: 'users',
                  localField: 'participants_ids',
                  foreignField: '_id',
                  as: 'participants',
                },
              },
            ]
          : []),
        {
          $unset: [
            'creators',
            'creatorId',
            'creator.password',
            'participants_ids',
            ...(unsetPassword ? ['password'] : []),
          ],
        },
        {
          $skip: (page - 1) * ITEMS_PER_PAGE,
        },
        {
          $limit: ITEMS_PER_PAGE,
        },
      ])
      .toArray()
  }

  async getRoomById({
    roomId,
    currentUser,
    unsetPassword,
    populateParticipants,
    participantsOffset,
  }: {
    unsetPassword?: boolean
    roomId: ObjectId
    currentUser: IUser
    populateParticipants?: boolean
    participantsOffset?: number
  }) {
    const [room] = await this.queryRooms({
      currentUser,
      $match: { _id: roomId },
      unsetPassword,
      populateParticipants,
      participantsOffset
    })

    return room
  }

  async roomWithPasswordExists({ _id, currentUser }: { _id: ObjectId; currentUser: IUser }) {
    const [room] = await this.queryRooms({ $match: { _id }, currentUser })

    return room
  }

  async createRoom({
    name,
    password,
    creatorId,
    currentUser,
  }: {
    currentUser: IUser
    name: string
    password?: string
    creatorId: ObjectId
  }) {
    const data = {
      name,
      creatorId,
      participants_ids: [],
      ...(password && { password })
    }

    const { insertedId: roomId } = await collections.rooms.insertOne(data)

    return await this.getRoomById({ currentUser, roomId })
  }

  async getRooms({
    currentUser,
    creatorId,
    page,
    participantsOffset,
    search,
    access,
    participants,
  }: IFitlerObj & {
    participantsOffset?: number
    creatorId?: ObjectId
    currentUser: IUser
    participants?: ObjectId[]
  }) {
    const $match = {} as any

    if (search) {
      $match.name = { $regex: new RegExp(search, 'i') }
    }

    if (access === 'public') {
      $match.password = { $exists: false }
    }

    if (access === 'private') {
      $match.password = { $exists: true }
    }

    if (participants) {
      $match.participants_ids = { $all: participants }
    }

    if (creatorId) {
      $match.creatorId = creatorId
    }

    return await this.queryRooms({ currentUser, $match, page, participantsOffset })
  }

  async addRoomParticipant({
    roomId,
    userId,
    password,
    currentUser,
  }: {
    currentUser: IUser
    roomId: ObjectId
    userId: ObjectId
    password?: string
  }) {
    const room = await this.getRoomById({
      roomId,
      currentUser,
      unsetPassword: false,
    })

    if (room.isPrivate) {
      if (room.password === password) {
        await collections.rooms.updateMany(
          { _id: roomId },
          {
            $push: { participants_ids: userId as any },
          }
        )
      } else {
        throw new IncorrectPasswordError()
      }
    } else {
      await collections.rooms.updateMany(
        { _id: roomId },
        {
          $push: { participants_ids: userId as any },
        }
      )
    }
  }

  async removeRoomParticipant({ roomId, userId }: { roomId: ObjectId; userId: ObjectId }) {
    await collections.rooms.updateOne({ _id: roomId }, { $pull: { participants_ids: userId } })
  }

  async getTotalRoomsPages({ search, access }: { search?: string; access?: IFitlerObj['access'] }) {
    let totalPages = 0

    const $match = {} as any

    if (search) {
      $match.name = { $regex: new RegExp(search, 'i') }
    }

    if (access === 'public') {
      $match.isPrivate = false
    }

    if (access === 'private') {
      $match.isPrivate = true
    }

    const totalDocuments = (await collections.rooms.countDocuments($match)) as any

    totalPages += Math.floor(totalDocuments / ITEMS_PER_PAGE)

    if (totalDocuments % ITEMS_PER_PAGE !== 0) {
      totalPages++
    }

    return totalPages
  }

  async appendMessage({ roomId, messageId }: { roomId: ObjectId; messageId: ObjectId }) {
    await collections.rooms.updateOne({ _id: roomId }, { $push: { messages_ids: messageId } })
  }

  async deleteRoom({ roomId }: { roomId: ObjectId }) {
    await collections.rooms.deleteOne({ _id: roomId })
  }
}

export default new RoomsService()
