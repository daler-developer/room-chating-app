import { AxiosResponse } from 'axios'
import { IFilterObj as IUsersFilterObj } from "../pages/users"
import { UpdateProfileProps } from '../redux/slices/usersSlice'
import { IUser } from '../types'
import {  } from '../types'
import client from './client'

export interface IAuthResponse {
  user: IUser
  accessToken: string
  refreshToken: string
}

class UsersService {
  async getMe() {
    const result = await client.get<Pick<IAuthResponse, 'user'>>(
      '/api/users/me'
    )

    return result
  }

  async login(username: string, password: string) {
    const result = await client.post<IAuthResponse>(
      '/api/users/login',
      { username, password }
    )

    return result
  }

  async register(
    username: string,
    firstName: string,
    lastName: string,
    password: string
  ) {
    const result = await client.post<IAuthResponse>('/api/users/register', {
      username,
      firstName,
      lastName,
      password,
    })

    return result
  }

  async getUsers({ search, status, page }: IUsersFilterObj) {
    const result = await client.get<{ users: IUser[]; totalPages: number }>(
      '/api/users',
      {
        params: { search, status, page },
      }
    )

    return result
  }
  
  async getUser({ userId }: { userId: string }) {
    const result = await client.get<{ user: IUser }>(`/api/users/${userId}`)

    return result
  }
  
  async getRoomParticipants ({ roomId, offset }: { roomId: string, offset?: number }) {
    const result = await client.get<{ users: Omit<IUser, 'participants'>[] }>(`/api/rooms/${roomId}/participants`, {
      params: { offset }
    })
  
    return result
  }

  async refreshToken() {
    const result = await client.post<IAuthResponse>('/api/users/refresh-token')

    return result
  }

  async updateProfile({
    firstName,
    lastName,
    username,
    avatar,
    removeAvatar,
  }: UpdateProfileProps) {
    const form = new FormData()

    if (username) {
      form.append('username', username)
    }
    if (firstName) {
      form.append('firstName', firstName)
    }
    if (lastName) {
      form.append('lastName', lastName)
    }
    if (removeAvatar) {
      form.append('removeAvatar', 'true')
    } else if (avatar) {
      form.append('avatar', avatar)
    }

    const result = await client.patch<{ user: IUser }>(
      '/api/users/profile/update',
      form
    )

    return result
  }
}

export default new UsersService()
