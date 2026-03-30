import { Router } from 'express'
import { loginController, logoutController, meController } from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { loginSchema } from '../validators/auth.validator'

const router = Router()

router.post('/login', validateBody(loginSchema), loginController)
router.post('/logout', authMiddleware, logoutController)
router.get('/me', authMiddleware, meController)

export { router as authRouter }

