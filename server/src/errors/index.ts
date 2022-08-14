import { ErrorCodeType } from '../types'

export class RequestError extends Error {
  status: number
  errorCode: ErrorCodeType
  errors?: any[]

  constructor({
    message,
    status,
    errors,
    errorCode,
  }: {
    errorCode: ErrorCodeType
    message: string
    status: number
    errors?: any[]
  }) {
    super(message)
    this.status = status
    this.errors = errors
    this.errorCode = errorCode
  }
}

export class UserWithSameUsernameAlreadyExistsError extends RequestError {
  constructor() {
    super({
      message: 'User with same username already exists',
      status: 400,
      errorCode: 'user_already_exists',
    })
  }
}

export class NotAuthenticatedError extends RequestError {
  constructor() {
    super({
      message: 'Not authenticated',
      status: 401,
      errorCode: 'not_authenticated',
    })
  }
}

export class UserNotFoundError extends RequestError {
  constructor() {
    super({
      message: 'User was not found',
      status: 404,
      errorCode: 'user_not_found',
    })
  }
}

export class IncorrectPasswordError extends RequestError {
  constructor() {
    super({
      message: 'Incorrect password',
      status: 400,
      errorCode: 'incorrect_password',
    })
  }
}

export class ValidationError extends RequestError {
  constructor(errors: any[]) {
    super({
      message: 'Invalid inputs',
      status: 500,
      errors,
      errorCode: 'validation_error',
    })
  }
}

export class UnknownError extends RequestError {
  constructor() {
    super({ message: 'Unknown Error', status: 500, errorCode: 'unknown_error' })
  }
}
