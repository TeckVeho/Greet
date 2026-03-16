import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { deleteFile, uploadFile } from '../services/file.service'
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
      const result = await restaurantService.create({
        ...req.body,
        companyId: req.user!.companyId,
        createdById: req.user!.userId,
      })
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
      const result = await restaurantService.update(
        restaurantId,
        req.body,
        req.user!.userId,
        req.user!.role,
      )
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

  public uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: { code: 'NO_FILE', message: 'ファイルが添付されていません' },
        })
        return
      }

      const url = await uploadFile(req.file)
      res.status(StatusCodes.OK).json({ success: true, data: { url } })
    } catch (error) {
      next(error)
    }
  }

  public deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { url } = req.body
      if (!url || typeof url !== 'string') {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: { code: 'INVALID_URL', message: '削除するファイルのURLが必要です' },
        })
        return
      }

      await deleteFile(url)
      res.status(StatusCodes.OK).json({ success: true, data: { message: '画像を削除しました' } })
    } catch (error) {
      next(error)
    }
  }
}

export const restaurantController = new RestaurantController()
