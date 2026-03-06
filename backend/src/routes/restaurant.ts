import { Router } from 'express'
import { restaurantController } from '../controllers/restaurant.controller'
import { reviewController } from '../controllers/review.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import {
  createRestaurantSchema,
  restaurantIdSchema,
  updateRestaurantSchema,
} from '../validators/restaurant.validator'
import { createReviewSchema } from '../validators/review.validator'

const router = Router()

router.use(authMiddleware)

// GET /api/restaurants
router.get('/', restaurantController.getRestaurants)

// GET /api/restaurants/:id
router.get('/:restaurantId', validateParams(restaurantIdSchema), restaurantController.getRestaurantById)

// POST /api/restaurants
router.post('/', validateBody(createRestaurantSchema), restaurantController.createRestaurant)

// PUT /api/restaurants/:id
router.put(
  '/:restaurantId',
  validateParams(restaurantIdSchema),
  validateBody(updateRestaurantSchema),
  restaurantController.updateRestaurant,
)

// DELETE /api/restaurants/:id (admin only)
router.delete(
  '/:restaurantId',
  adminMiddleware,
  validateParams(restaurantIdSchema),
  restaurantController.deleteRestaurant,
)

// POST /api/restaurants/:restaurantId/reviews
router.post(
  '/:restaurantId/reviews',
  validateParams(restaurantIdSchema),
  validateBody(createReviewSchema),
  reviewController.createReview,
)

router.use(errorMiddleware)

export { router as restaurantRouter }
