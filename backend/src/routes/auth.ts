import { Router } from 'express'
import { loginController, logoutController, meController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/login', loginController)
router.post('/logout', authMiddleware, logoutController)
router.get('/me', authMiddleware, meController)

export { router as authRouter }

