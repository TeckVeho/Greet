import { Request, Response } from 'express'
import { reviewService } from '../services/review.service'

class ReviewController {
  public getReviews = async (req: Request, res: Response) => {
    const result = await reviewService.findAll()
    res.status(result.statusCode).json(result)
  }

  public getReviewById = async (req: Request, res: Response) => {
    const rawReviewId = req.params.reviewId
    const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId
    const result = await reviewService.findById(reviewId)
    res.status(result.statusCode).json(result)
  }

  public createReview = async (req: Request, res: Response) => {
    const result = await reviewService.create(req.body)
    res.status(result.statusCode).json(result)
  }

  public updateReview = async (req: Request, res: Response) => {
    const rawReviewId = req.params.reviewId
    const reviewId = Array.isArray(rawReviewId) ? rawReviewId[0] : rawReviewId
    const result = await reviewService.update(reviewId, req.body)
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
