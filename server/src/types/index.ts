import { ObjectId } from 'mongodb'

export interface IErrorResponse {
  message: string
  errors: {
    path: string
    messages: string[]
  }[]
}

export interface IUser {
  _id?: ObjectId
  username?: string
  firstName?: string
  lastName?: string
  password?: string
  isOnline?: boolean
}

export interface IRoom {
  _id: ObjectId
  creator: IUser
  isCurrentUserJoined: boolean
  totalNumParticipants: boolean
  participants_ids: ObjectId[] 
  isCreatedByCurrentUser: boolean
}
