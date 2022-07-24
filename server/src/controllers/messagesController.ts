import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import * as multer from 'multer'
import messagesService from '../services/messagesService'
import * as Joi from 'joi'
import { ValidationError } from '../errors'

const createMessageValidationSchema = Joi.object<{ text?: string, roomId: ObjectId, images?: any[] }>({
  text: Joi.string().min(1).max(500),
  roomId: Joi.required(),
  images: Joi.array()
})

class MessagesController {

  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { error, value: { images, text, roomId } } = createMessageValidationSchema.validate({
        images: req.files,
        text: req.body.text,
        roomId: new ObjectId(req.params.roomId)
      })

      if (error) {
        throw new ValidationError()
      }

      if (!images && !text) {
        throw new ValidationError()
      }
      
      const currentUser = req.user

      const message = await messagesService.createMessage({ 
        creatorId: currentUser._id, 
        roomId, 
        text,
        ...Object.assign({}, images && images.length ? { images } : {}) 
      })

      return res.status(202).json({ message })
    } catch (e) {
      return next(e)
    }
  }

}

export default new MessagesController()
