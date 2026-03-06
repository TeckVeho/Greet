import { NextFunction, Request, Response } from 'express'
import { restaurantService } from '../services/restaurant.service'

class RestaurantController {
  public getRestaurants = async (req: Request, res: Response) => {
    const result = await restaurantService.findAll(req.query as any)
    res.status(result.statusCode).json(result)
  }

  public getRestaurantById = async (req: Request, res: Response) => {
    const rawRestaurantId = req.params.restaurantId
    const restaurantId = Array.isArray(rawRestaurantId) ? rawRestaurantId[0] : rawRestaurantId
    const userId = req.user?.userId
    const result = await restaurantService.findById(restaurantId, userId)
    res.status(result.statusCode).json(result)
  }

  public createRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await restaurantService.create(req.body)
      res.status(result.statusCode).json(result)
    } catch (error) {
      next(error)
    }
  }

  public updateRestaurant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = Array.isArray(req.params.restaurantId)
        ? req.params.restaurantId[0]
        : req.params.restaurantId
      const result = await restaurantService.update(restaurantId, req.body)
      res.status(result.statusCode).json(result)
    } catch (error) {
      next(error)
    }
  }

  public deleteRestaurant = async (req: Request, res: Response) => {
    const rawRestaurantId = req.params.restaurantId
    const restaurantId = Array.isArray(rawRestaurantId) ? rawRestaurantId[0] : rawRestaurantId
    const result = await restaurantService.delete(restaurantId)
    res.status(result.statusCode).json(result)
  }
}

export const restaurantController = new RestaurantController()
