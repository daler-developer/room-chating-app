import { NextFunction, Request, Response } from 'express'
import usersService, { IFitlerObj } from '../services/usersService'
import { ValidationError, UserWithSameUsernameAlreadyExistsError, IncorrectPasswordError } from '../errors'
import tokensService from '../services/tokensService'
import { ObjectId } from 'mongodb'
import * as Joi from 'joi'
import * as yup from 'yup'
import * as yupUtils from '../utils/yup'

const getUsersValidationSchema = Joi.object<{ page?: number, search?: string, sort?: IFitlerObj['sort'] }>({
  page: Joi.number().min(1),
  search: Joi.string().trim().allow(''),
  sort: Joi.string().trim().valid('all', 'online', 'offline')
})

const loginValidationSchema = yup.object({
  username: yup.string().min(3).max(20).required(),
  password: yup.string().min(3).max(20).required()
})

const registerValidationSchema = Joi.object<{ username: string, firstName: string, lastName: string, password: string }>({
  username: Joi.string().required().min(3).max(20),
  firstName: Joi.string().required().min(3).max(20),
  lastName: Joi.string().required().min(3).max(20),
  password: Joi.string().required().min(3).max(20)
})

class UsersController {

  async getMe (req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ user: req.user })
  }

  async register (req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value: { username, firstName, lastName, password } } = registerValidationSchema.validate(req.body)

      if (error) {
        throw new ValidationError()
      }
  
      if (await usersService.userWithUsernameExists(username)) {
        throw new UserWithSameUsernameAlreadyExistsError()
      }
  
      const user = await usersService.createUser({ username, firstName, lastName, password })
      const { accessToken, refreshToken } = tokensService.generateTokens(user._id)

      await tokensService.saveRefreshToken(user._id, refreshToken)
  
      return res.status(202).json({ user, accessToken, refreshToken })      
    } catch (e) {
      return next(e)
    }
  }

  async login (req: Request, res: Response, next: NextFunction) {
    try {
      let data: { username: string, password: string } = { username: null!, password: null! }

      try {
        const { password, username } = await loginValidationSchema.validate(req.body, { abortEarly: false })
        
        data = { password, username }
      } catch (e) { 
        if (e instanceof yup.ValidationError) {
          const errors = yupUtils.formatErrors(e)
  
          throw new ValidationError(errors)
        } else {
          throw e
        }
      }

      const { username, password } = data

      const candidate = await usersService.getUserByUsername(username)
      
      if (candidate.password !== password) {
        throw new IncorrectPasswordError()
      }

      const { accessToken, refreshToken } = tokensService.generateTokens(candidate._id)

      await tokensService.saveRefreshToken(candidate._id, refreshToken)

      res.cookie('refreshToken', refreshToken, { httpOnly: true })

      return res.status(200).json({ user: candidate, accessToken, refreshToken })
    } catch (e) {
      return next(e)
    }
  }

  async getUsers (req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query

      const { error, value: { page, search, sort } } = getUsersValidationSchema.validate({
        page: query.page,
        search: query.search,
        sort: query.sort
      })

      if (error) {
        throw new ValidationError()
      }
  
      const users = await usersService.getUsers({ page, search, sort })
      const totalPages = await usersService.getTotalUsersPages({ search, sort })
  
      return res.status(200).json({ users, totalPages })
    } catch (e) {
      return next(e)
    }
  }

  async refreshToken (req: Request, res: Response, next: NextFunction) {
    try {
      const cookies = req.cookies
  
      const decoded = tokensService.verifyToken(cookies.refreshToken) as any
  
      const { accessToken, refreshToken } = tokensService.generateTokens(new ObjectId(decoded.userId))
  
      res.cookie('refreshToken', refreshToken, { httpOnly: true })
  
      return res.status(200).json({ accessToken, refreshToken })
    } catch (e) {
      return next(e)
    }
  }

}


export default new UsersController()
