import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { tenantMiddleware } from '../middleware/tenant.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { favoriteController } from '../controllers/favorite.controller'
import { addFavoriteSchema, favoriteRestaurantIdSchema } from '../validators/favorite.validator'

const router = Router()

router.use(authMiddleware, tenantMiddleware)

router.get('/', favoriteController.listFavorites)

router.post('/', validateBody(addFavoriteSchema), favoriteController.addFavorite)

router.delete(
  '/:restaurantId',
  validateParams(favoriteRestaurantIdSchema),
  favoriteController.removeFavorite,
)

router.use(errorMiddleware)

export { router as favoriteRouter }

