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

  private async queryUsers({ filters = {}, page = 1 }: { filters?: object, page?: number }) {
    const results = await collections.users.aggregate([
      {
        $match: {
          ...filters
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
    return await collections.users.findOne({ _id })
  }

  async getUserByUsername (username: string) {
    const user = await collections.users.findOne({ username })

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

  async getUsers ({ page = 1, search, sort }: IFitlerObj) {
    const filters = {} as any

    if (search) {
      filters.username = { $regex: new RegExp(search, 'i') }
    }
    
    if (sort === 'online') {
      filters.isOnline = true
    }
    
    if (sort === 'offline') {
      filters.isOnline = false
    }

    return this.queryUsers({ page, filters })
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
}

export default new UsersService()
