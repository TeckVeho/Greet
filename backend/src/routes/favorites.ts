import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { favoriteController } from '../controllers/favorite.controller'
import { addFavoriteSchema, favoriteRestaurantIdSchema } from '../validators/favorite.validator'

const router = Router()

router.use(authMiddleware)

router.get('/', favoriteController.listFavorites)

router.post('/', validateBody(addFavoriteSchema), favoriteController.addFavorite)

router.delete(
  '/:restaurantId',
  validateParams(favoriteRestaurantIdSchema),
  favoriteController.removeFavorite,
)

router.use(errorMiddleware)

export { router as favoriteRouter }

