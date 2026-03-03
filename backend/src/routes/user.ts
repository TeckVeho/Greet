import { errorMiddleware } from '../middleware/error.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { createUserSchema, userIdSchema } from '../validators/user.validator'

const router = Router()

router.use(authMiddleware)

// get users
router.get('/', adminMiddleware, userController.getUsers)
// create user
router.post('/', adminMiddleware, validateBody(createUserSchema), userController.createUser)
// get user by id
router.get('/:userId', adminMiddleware, validateParams(userIdSchema), userController.getUserById)
// update user
router.put('/:userId', adminMiddleware, validateParams(userIdSchema), userController.updateUser)
// delete user
router.delete('/:userId', adminMiddleware, validateParams(userIdSchema), userController.deleteUser)

router.use(errorMiddleware)

export { router as userRouter }
