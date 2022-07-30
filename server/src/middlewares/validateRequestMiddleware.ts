import * as express from 'express'
import { RequestError } from '../errors'
import { IErrorResponse } from '../types'

export default (error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(error)

  if (error instanceof RequestError) {
    const json: IErrorResponse = {
      message: error.message,
      errorCode: error.errorCode,
      ...(error.errors && { errors: error.errors })
    }

    return res.status(error.status).json(json)
  }

  const json: IErrorResponse = {
    message: 'Unknown error',
    errorCode: 'unknown_error'
  }

  return res.status(500).json(json)
}
