import * as express from 'express'
import roomsController from '../controllers/roomsController'
import populateUserMiddleware from '../middlewares/populateUserMiddleware'

const router = express.Router()

router.get('/rooms', populateUserMiddleware, roomsController.getRooms)
router.post('/rooms', populateUserMiddleware, roomsController.createRoom)
router.post('/rooms/:_id/participants', populateUserMiddleware, roomsController.addParticipant)
router.delete('/rooms/:_id/leave', populateUserMiddleware, roomsController.leaveRoom)
router.delete('/rooms/:_id', populateUserMiddleware, roomsController.deleteRoom)
router.get('/users/:userId/rooms/created', populateUserMiddleware, roomsController.getRoomsUserCreated)
router.get('/users/:userId/rooms/joined', populateUserMiddleware, roomsController.getRoomsUserJoined)

export default router
