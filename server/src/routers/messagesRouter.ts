import * as express from 'express'
import messagesController from '../controllers/messagesController'
import populateUserMiddleware from '../middlewares/populateUserMiddleware'
import {} from '../'
import { messageImagesUpload } from '../utils/uploads'

const router = express.Router()

router.post('/rooms/:roomId/messages', populateUserMiddleware, messageImagesUpload.array('images'), messagesController.createMessage)

export default router
