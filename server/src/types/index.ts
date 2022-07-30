import { ObjectId } from 'mongodb'

export type ErrorCodeType =
  'validation_error' |
  'user_not_found' |
  'incorrect_password' |
  'not_authenticated' |
  'user_already_exists' |
  'unknown_error'

export interface IErrorResponse {
  errorCode: ErrorCodeType
  message: string
  errors?: {
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
