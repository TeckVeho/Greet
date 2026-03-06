import { Request, Response } from 'express'
import { reviewService } from '../services/review.service'

class ReviewController {
  public createReview = async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      })
      return
    }

    const rawRestaurantId = req.params.restaurantId
    const restaurantId = Array.isArray(rawRestaurantId) ? rawRestaurantId[0] : rawRestaurantId
    const result = await reviewService.create(restaurantId, req.user.userId, req.body)
    res.status(result.statusCode).json(result)
  }

  public deleteReview = async (req: Request, res: Response) => {
    const rawReviewId = req.params.reviewId
    const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId
    const result = await reviewService.delete(reviewId)
    res.status(result.statusCode).json(result)
  }
}

export const reviewController = new ReviewController()
