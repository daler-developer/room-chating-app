import { UserNotFoundError, ValidationError } from "../errors"
import collections from '../db/collections'
import { ObjectId } from 'mongodb'
import * as Joi from 'joi'

const ITEMS_PER_PAGE = 4

export interface IFitlerObj {
  page?: number
  search?: string
  sort?: 'all' | 'online' | 'offline'
}

class UsersService {

  private async queryUsers({ $match = {}, page = 1 }: { $match?: object, page?: number }) {
    const results = await collections.users.aggregate([
      {
        $match: {
          ...$match
        }
      },
      {
        $skip: (page - 1) * ITEMS_PER_PAGE
      },
      {
        $limit: ITEMS_PER_PAGE
      }
    ]).toArray()

    return results
  }

  async setUserOnlineStatus(userId: ObjectId, isOnline: boolean) {
    await collections.users.updateOne({ _id: userId }, { $set: { isOnline} })
  }

  async userWithUsernameExists(username: string) {
    return !!(await collections.users.findOne({ username }))
  }

  async getUserById (_id: ObjectId) {
    const [user] = await this.queryUsers({ $match: { _id }})

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }

  async getUserByUsername (username: string) {
    const [user] = await this.queryUsers({ $match: { username } })

    if (!user) {
      throw new UserNotFoundError()
    }

    return user
  }
  
  async createUser (data: { username: string, password: string, firstName: string, lastName: string, }) {
    const { username, firstName, lastName, password } = data

    const { insertedId } = await collections.users.insertOne({
      username,
      firstName,
      lastName,
      password
    })

    return await this.getUserById(insertedId)
  }

  async getUsers ({ page, search, sort }: IFitlerObj) {
    const $match = {} as any

    if (search) {
      $match.username = { $regex: new RegExp(search, 'i') }
    }
    
    if (sort === 'online') {
      $match.isOnline = true
    }
    
    if (sort === 'offline') {
      $match.isOnline = false
    }

    return this.queryUsers({ page, $match })
  }

  async getTotalUsersPages ({ search, sort }: { search?: string, sort?: IFitlerObj['sort'] }) {
    let totalPages = 0

    const $match = {} as any

    if (search) {
      $match.username = { $regex: new RegExp(search, 'i') }
    }
    
    if (sort === 'online') {
      $match.isOnline = true
    }
    
    if (sort === 'offline') {
      $match.isOnline = false
    }

    const totalDocuments = await collections.users.countDocuments($match) as any

    totalPages += Math.floor(totalDocuments / ITEMS_PER_PAGE)

    if (totalDocuments % ITEMS_PER_PAGE !== 0) {
      totalPages++
    }

    return totalPages
  }

  async updateProfile ({ userId, removeAvatar = false, newAvatar, newFirstName, newLastName, newUsername }: { userId: ObjectId, newUsername?: string, newFirstName?: string, newLastName?: string, newAvatar?: string, removeAvatar?: boolean }) {
    const $set = {} as {[key: string]: any}
    const $unset = {} as {[key: string]: 1 | 0}

    if (newFirstName) {
      $set.firstName = newFirstName
    }
    if (newLastName) {
      $set.lastName = newLastName
    }
    if (newUsername) {
      $set.username = newUsername
    }

    if (removeAvatar) {
      $unset.avatar = 1
    } else if (newAvatar) {
      $set.avatar = newAvatar
    }

    await collections.users.updateOne({ _id: userId }, { $set, $unset })

    const updatedUser = await this.getUserById(userId)

    return updatedUser
  }

  generateAvatarUrl (filename: string) {
    return `/uploads/avatars/${filename}`
  }
}

export default new UsersService()
