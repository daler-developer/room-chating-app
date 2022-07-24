import * as express from 'express'
import roomsController from '../controllers/roomsController'
import populateUserMiddleware from '../middlewares/populateUserMiddleware'

const router = express.Router()

router.get('/rooms', populateUserMiddleware, roomsController.getRooms)
router.post('/rooms', populateUserMiddleware, roomsController.createRoom)
router.post('/rooms/:_id/participants', populateUserMiddleware, roomsController.addParticipant)
router.delete('/rooms/:_id/leave', populateUserMiddleware, roomsController.leaveRoom)
router.delete('/rooms/:_id', populateUserMiddleware, roomsController.deleteRoom)

export default router
