import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import { NotAuthenticatedError } from '../errors'
import tokensService from '../services/tokensService'
import usersService from '../services/usersService'
import { IUser } from '../types'


export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorization =  req.headers['authorization']
  
    if (authorization) {
      const token = authorization.split(' ')[1]

      if (token) {
        const decoded = tokensService.verifyToken(token) as any

        const user = await usersService.getUserById(new ObjectId(decoded.userId))

        req.user = user

        return next()
      }
    }
  
    throw new NotAuthenticatedError()
  } catch (e) {
    next(e)
  }
}
