import * as express from 'express'
import usersController from '../controllers/usersController'
import populateUserMiddleware from '../middlewares/populateUserMiddleware'
import { avatarsUpload } from '../utils/uploads'

const router = express.Router()

router.get('/rooms/:roomId/participants', populateUserMiddleware, usersController.getRoomParticipants)
router.post('/users/register', usersController.register)
router.post('/users/login', usersController.login)
router.post('/users/refresh-token', usersController.refreshToken)
router.get('/users', populateUserMiddleware, usersController.getUsers)
router.get('/users/me', populateUserMiddleware, usersController.getMe)
router.get('/users/:_id', populateUserMiddleware, usersController.getUser)
router.patch(
  '/users/profile/update',
  populateUserMiddleware,
  avatarsUpload.single('avatar'),
  usersController.updateProfile
)

export default router
