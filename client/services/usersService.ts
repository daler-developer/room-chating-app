import { IUsersFilterObj, IUser } from '../models'
import { IErrorResponse } from '../types'
import client from './client'

export interface IAuthResponse {
  user: IUser,
  accessToken: string
  refreshToken: string
}

class UsersService {

  async getMe() {
    const result = await client.get<Pick<IAuthResponse, 'user'>>('/api/users/me')

    return result
  }

  async login(username: string, password: string) {
    const result = await client.post<IAuthResponse | IErrorResponse>('/api/users/login', { username, password })

    return result
  }
  
  async register(username: string, firstName: string, lastName: string, password: string) {
    const result = await client.post<IAuthResponse>('/api/users/register', { username, firstName, lastName, password })

    return result
  }

  async getUsers({ search, sort, page }: IUsersFilterObj) {
    const result = await client.get<{ users: IUser[], totalPages: number }>('/api/users', {
      params: { search, sort, page }
    })

    return result
  }
  
}

export default new UsersService()
