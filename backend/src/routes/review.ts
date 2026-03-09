import { Router } from 'express'
import { reviewController } from '../controllers/review.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { tenantMiddleware } from '../middleware/tenant.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { validateParams } from '../middleware/validate.middleware'
import { reviewIdParamSchema } from '../validators/review.validator'

const router = Router()

router.use(authMiddleware, tenantMiddleware)

// DELETE /api/reviews/:id
router.delete('/:reviewId', validateParams(reviewIdParamSchema), reviewController.deleteReview)

router.use(errorMiddleware)

export { router as reviewRouter }
