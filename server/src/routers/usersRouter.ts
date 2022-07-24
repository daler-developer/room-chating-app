import * as express from 'express'
import usersController from '../controllers/usersController'
import populateUserMiddleware from '../middlewares/populateUserMiddleware'

const router = express.Router()

router.post('/users/register', usersController.register)
router.post('/users/login', usersController.login)
router.post('/users/refresh-token', usersController.refreshToken)
router.get('/users', populateUserMiddleware, usersController.getUsers)
router.get('/users/me', populateUserMiddleware, usersController.getMe)

export default router
