import { Router } from 'express'
import { userController } from '../controllers/user.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { tenantMiddleware } from '../middleware/tenant.middleware'
import { upload } from '../middleware/upload.middleware'
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware'
import {
  adminChangeUserPasswordSchema,
  createUserSchema,
  listUserQuerySchema,
  updateUserSchema,
  userIdSchema,
} from '../validators/user.validator'
const router = Router()

router.use(authMiddleware, tenantMiddleware)

// get users
router.get('/', adminMiddleware, validateQuery(listUserQuerySchema), userController.getUsers)
// create user
router.post(
  '/',
  adminMiddleware,
  upload.single('avatar'),
  validateBody(createUserSchema),
  userController.createUser,
)
// get user by id
router.get('/:userId', adminMiddleware, validateParams(userIdSchema), userController.getUserById)
// update user
router.put(
  '/:userId',
  adminMiddleware,
  upload.single('avatar'),
  validateParams(userIdSchema),
  validateBody(updateUserSchema),
  userController.updateUser,
)
// change user password (admin only)
router.patch(
  '/:userId/password',
  adminMiddleware,
  validateParams(userIdSchema),
  validateBody(adminChangeUserPasswordSchema),
  userController.changeUserPassword,
)
// delete user
router.delete('/:userId', adminMiddleware, validateParams(userIdSchema), userController.deleteUser)

router.use(errorMiddleware)

export { router as userRouter }
