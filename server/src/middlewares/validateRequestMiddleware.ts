import * as express from 'express'
import { RequestError } from '../errors'
import { IErrorResponse } from '../types'

export default (error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log(error)

  if (error instanceof RequestError) {
    return res.status(error.status).json({
      message: error.message,
      errorCode: error.errorCode,
      ...(error.errors && { errors: error.errors })
    })
  }

  return res.status(500).json({ message: 'Unknown error' })
}
