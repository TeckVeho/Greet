import { Router } from 'express'
import { restaurantController } from '../controllers/restaurant.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import {
  createRestaurantSchema,
  restaurantIdSchema,
  updateRestaurantSchema,
} from '../validators/restaurant.validator'

const router = Router()

router.use(authMiddleware)

// get restaurants
router.get('/', restaurantController.getRestaurants)
// create restaurant
router.post('/', validateBody(createRestaurantSchema), restaurantController.createRestaurant)
// update restaurant
router.put(
  '/:restaurantId',
  validateParams(restaurantIdSchema),
  validateBody(updateRestaurantSchema),
  restaurantController.updateRestaurant,
)
// delete restaurant
router.delete(
  '/:restaurantId',
  adminMiddleware,
  validateParams(restaurantIdSchema),
  restaurantController.deleteRestaurant,
)

router.use(errorMiddleware)

export { router as restaurantRouter }
