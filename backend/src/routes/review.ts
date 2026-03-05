import { Router } from 'express'
import { reviewController } from '../controllers/review.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import { createUserSchema, userIdSchema } from '../validators/user.validator'

const router = Router()

router.use(authMiddleware)

// get reviews
router.get('/', adminMiddleware, reviewController.getReviews)
// create review
router.post('/', adminMiddleware, validateBody(createUserSchema), reviewController.createReview)
// get review by id
router.get(
  '/:reviewId',
  adminMiddleware,
  validateParams(userIdSchema),
  reviewController.getReviewById,
)
// update review
router.put(
  '/:reviewId',
  adminMiddleware,
  validateParams(userIdSchema),
  reviewController.updateReview,
)
// delete review
router.delete(
  '/:reviewId',
  adminMiddleware,
  validateParams(userIdSchema),
  reviewController.deleteReview,
)

router.use(errorMiddleware)

export { router as reviewRouter }
