import { Router } from 'express'
import { reviewController } from '../controllers/review.controller'
import { adminMiddleware } from '../middleware/admin.middleware'
import { authMiddleware } from '../middleware/auth.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { validateBody, validateParams } from '../middleware/validate.middleware'
import { createReviewSchema, reviewIdParamSchema } from '../validators/review.validator'

const router = Router()

router.use(authMiddleware)

// get reviews
router.get('/', adminMiddleware, reviewController.getReviews)
// create review
router.post('/', validateBody(createReviewSchema), reviewController.createReview)
// get review by id
router.get(
  '/:reviewId',
  adminMiddleware,
  validateParams(reviewIdParamSchema),
  reviewController.getReviewById,
)
// update review
router.put('/:reviewId', validateParams(reviewIdParamSchema), reviewController.updateReview)
// delete review
router.delete(
  '/:reviewId',
  adminMiddleware,
  validateParams(reviewIdParamSchema),
  reviewController.deleteReview,
)

router.use(errorMiddleware)

export { router as reviewRouter }
