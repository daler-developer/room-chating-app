
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
  errors: {
    path: string
    messages: string[]
  }[]
}
