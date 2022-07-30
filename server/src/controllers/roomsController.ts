import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import roomsService, { IFitlerObj as IUsersFilterObj } from '../services/roomsService'
import { IncorrectPasswordError, ValidationError } from '../errors'
import * as Joi from 'joi'

const getRoomsValidationSchema = Joi.object<{ page?: number, search?: string, sort?: IUsersFilterObj['sort'] }>({
  page: Joi.number().min(1),
  search: Joi.string().trim().allow(''),
  sort: Joi.string().trim().valid('all', 'public', 'private')
})

const deleteRoomValidationScheam = Joi.object<{ password: string }>({
  password: Joi.string().trim().min(6).max(20).required()
})

class RoomsController {

  async getRooms (req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value: { page, search, sort } } = getRoomsValidationSchema.validate(req.query)

      if (error) {
        throw new ValidationError()
      }

      const rooms = await roomsService.getRooms({ currentUser: req.user!, page, search, sort })
      const totalPages = await roomsService.getTotalRoomsPages({ search, sort })

      return res.status(200).json({ rooms, totalPages })
    } catch (e) {
      return next(e)
    }
  }
  
  async createRoom (req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user
      const { name, password, isPrivate } = req.body

      const room = await roomsService.createRoom({ currentUser, name, isPrivate, password, creatorId: currentUser!._id  })

      return res.status(202).json({ room })
    } catch (e) {
      return next(e)
    }
  }
  
  async addParticipant (req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user
      const password = req.body.password
      const roomId = new ObjectId(req.params._id)

      await roomsService.addRoomParticipant({ userId: currentUser._id, roomId, password, currentUser })

      return res.json('added')
    } catch (e) {
      return next(e)
    }
  }

  async leaveRoom (req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = new ObjectId(req.params._id)
      const userId = req.user!._id
     
      await roomsService.removeRoomParticipant({ roomId, userId })
      
      return res.json('left')
    } catch (e) {
      return next(e)
    } 
  }

  async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const currentUser = req.user

      const { error, value: { password } } = deleteRoomValidationScheam.validate({
        password: req.body.password
      })

      if (error) {
        throw new ValidationError()
      }

      const roomId = new ObjectId(req.params._id)

      const room = await roomsService.getRoomById({ currentUser, roomId, unsetPassword: false })

      if (room.password !== password) {
        throw new IncorrectPasswordError()
      }
      
      await roomsService.deleteRoom({ roomId })

      return res.json('deleted')
    } catch (e) {
      return next(e)
    }
  }

  async getRoomsUserCreated (req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = new ObjectId(req.params.userId)

      const rooms = await roomsService.getRooms({ currentUser: req.user, creatorId })
      
      return res.status(200).json({ rooms })
    } catch (e) {
      return next(e)
    }
  }

  async getRoomsUserJoined (req: Request, res: Response, next: NextFunction) {
    try {
      const rooms = await roomsService.getRooms({ currentUser: req.user, participants: [req.user._id] })

      return res.status(200).json({ rooms })
    } catch (e) {
      return next(e)
    }
  }

}


export default new RoomsController()
