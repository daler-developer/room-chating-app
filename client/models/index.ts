
export interface IUser {
  _id: string
  username: string
  firstName: string
  lastName: string
  isOnline: boolean
  avatar: string
}

export interface IRoom {
  _id: string
  name: string
  isPrivate: boolean
  password?: string
  creator: IUser
  participants: IUser[]
  isCurrentUserJoined: boolean
  totalNumParticipants: number
  isCreatedByCurrentUser: boolean
}

export interface IUsersFilterObj {
  search?: string
  sort?: 'all' | 'online' | 'offline'
  page?: number
}

export interface IRoomsFilterObj {
  search?: string
  sort?: 'all' | 'public' | 'private'
  page?: number
}
