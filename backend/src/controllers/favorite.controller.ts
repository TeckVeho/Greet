import type { Request, Response } from 'express'
import { favoriteService } from '../services/favorite.service'

class FavoriteController {
  public listFavorites = async (req: Request, res: Response) => {
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

    const result = await favoriteService.listForUser(req.user.userId)
    res.status(result.statusCode).json(result)
  }

  public addFavorite = async (req: Request, res: Response) => {
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

    const { restaurantId } = req.body as { restaurantId: string }
    const result = await favoriteService.add(req.user.userId, restaurantId)
    res.status(result.statusCode).json(result)
  }

  public removeFavorite = async (req: Request, res: Response) => {
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

    const result = await favoriteService.remove(req.user.userId, restaurantId)
    res.status(result.statusCode).json(result)
  }
}

export const favoriteController = new FavoriteController()

