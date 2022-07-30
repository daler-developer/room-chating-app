import { NextFunction, Request, Response } from 'express'
import usersService, { IFitlerObj } from '../services/usersService'
import { ValidationError, UserWithSameUsernameAlreadyExistsError, IncorrectPasswordError } from '../errors'
import tokensService from '../services/tokensService'
import { ObjectId } from 'mongodb'
import * as yup from 'yup'
import * as yupUtils from '../utils/yup'

const getUsersValidationSchema = yup.object({
  page: yup.number().min(1),
  search: yup.string().trim(),
  sort: yup.string().trim()
})

const loginValidationSchema = yup.object({
  username: yup.string().min(3).max(20).required(),
  password: yup.string().min(3).max(20).required()
})

const registerValidationSchema = yup.object({
  username: yup.string().required().min(3).max(20),
  password: yup.string().required().min(3).max(20),
  firstName: yup.string().required().min(3).max(20),
  lastName: yup.string().required().min(3).max(20)
})

const getUserValidationSchema = yup.object({
  _id: yup.string()
})

const updateProfileValidationSchema = yup.object({
  username: yup.string().min(3).max(20),
  firstName: yup.string().min(3).max(20),
  lastName: yup.string().min(3).max(20),
  removeAvatar: yup.bool().default(false)
})

class UsersController {

  async getMe (req: Request, res: Response, next: NextFunction) {
    return res.status(200).json({ user: req.user })
  }

  async register (req: Request, res: Response, next: NextFunction) {
    try {
      interface IValidatedData { username: string, password: string, firstName: string, lastName: string }

      let validatedData: unknown

      try {
        validatedData = await registerValidationSchema.validate(req.body, { abortEarly: false })
      } catch (e) { 
        if (e instanceof yup.ValidationError) {
          const errors = yupUtils.formatErrors(e)
  
          throw new ValidationError(errors)
        } else {
          throw e
        }
      }

      const { firstName, lastName, password, username } = validatedData as IValidatedData
  
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
      interface IValidatedData { username: string, password: string }

      let validatedData: unknown

      try {
        validatedData = await loginValidationSchema.validate(req.body, { abortEarly: false })
      } catch (e) { 
        if (e instanceof yup.ValidationError) {
          const errors = yupUtils.formatErrors(e)
  
          throw new ValidationError(errors)
        } else {
          throw e
        }
      }

      const { username, password } = validatedData as IValidatedData

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
      interface IValidatedData { page?: number, search?: string, sort?: 'all' | 'online' | 'offline' }

      let validatedData: unknown

      try {
        validatedData = await getUsersValidationSchema.validate(req.query, { abortEarly: false })
      } catch (e) { 
        if (e instanceof yup.ValidationError) {
          const errors = yupUtils.formatErrors(e)
  
          throw new ValidationError(errors)
        } else {
          throw e
        }
      }
      
      const { page, search, sort } = validatedData as IValidatedData
  
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

  async getUser (req: Request, res: Response, next: NextFunction) {
    try {
      const userId = new ObjectId(req.params._id)
      
      const user = await usersService.getUserById(userId)

      // return res.json('test')
      return res.status(200).json({ user })
    } catch (e) {
      return next(e)
    }
  }

  async updateProfile (req: Request, res: Response, next: NextFunction) {
    try {
      interface IValidatedData { username?: string, password?: string, firstName?: string, lastName?: string, removeAvatar: boolean }

      let validatedData: unknown

      try {
        validatedData = await updateProfileValidationSchema.validate(req.body)
      } catch (e) {
        if (e instanceof yup.ValidationError) {
          const errors = yupUtils.formatErrors(e)
  
          throw new ValidationError(errors)
        } else {
          throw e
        } 
      }

      const { removeAvatar, firstName, lastName, username } = validatedData as IValidatedData

      const arg = { userId: req.user._id, removeAvatar } as any

      if (firstName) {
        arg.newFirstName = firstName
      }
      if (lastName) {
        arg.newLastName = lastName
      }
      if (username) {
        arg.newUsername = username
      }
      if (req.file) {
        arg.newAvatar = usersService.generateAvatarUrl(req.file.filename)
      }
      
      const updatedUser = await usersService.updateProfile(arg)

      return res.json({ user: updatedUser })
    } catch (e) {
      return next(e)
    }
  }

}


export default new UsersController()
