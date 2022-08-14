import { Request, Response, NextFunction } from 'express'
import { ObjectId } from 'mongodb'
import messagesService from '../services/messagesService'
import * as yup from 'yup'
import { ValidationError } from '../errors'
import * as yupUtils from '../utils/yup'

const createMessageValidationSchema = yup.object({
  text: yup.string().max(500).required(),
  images: yup.array(),
})

const getRoomMessagesValidationSchema = yup.object({
  offset: yup.number().min(0)
})

class MessagesController {
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = new ObjectId(req.params.roomId)
      const { images, text } = await yupUtils.validateData({
        images: req.files,
        text: req.body.text
      }, createMessageValidationSchema)

      const message = await messagesService.createMessage({
        currentUser: req.user,
        roomId,
        text,
        ...Object.assign({}, images && images.length ? { images } : {}),
      })

      return res.status(202).json({ message })
    } catch (e) {
      return next(e)
    }
  }

  async getRoomMessages (req: Request, res: Response, next: NextFunction) {
    try {
      const roomId = new ObjectId(req.params.roomId)
      const { offset } = await getRoomMessagesValidationSchema.validate({
        offset: req.query.offset
      })

      const messages = await messagesService.getRoomMessages({ roomId, offset, currentUser: req.user })

      return res.status(200).json({ messages })
    } catch (e) {
      return next(e)
    }
  }
}

export default new MessagesController()
