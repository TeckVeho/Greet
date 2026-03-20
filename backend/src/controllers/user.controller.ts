import { Request, Response } from 'express'
import { userService } from '../services'
import { listUserQuery } from '../validators/user.validator'

class UserController {
  public getUsers = async (req: Request, res: Response) => {
    const result = await userService.findAll(req.query as listUserQuery, req.user!)
    res.status(result.statusCode).json(result)
  }

  public getUserById = async (req: Request, res: Response) => {
    const rawUserId = req.params.userId
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
    const result = await userService.findById(userId, req.user!)
    res.status(result.statusCode).json(result)
  }

  public createUser = async (req: Request, res: Response) => {
    const result = await userService.create(req.body, req.file)
    res.status(result.statusCode).json(result)
  }

  public updateUser = async (req: Request, res: Response) => {
    const rawUserId = req.params.userId
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
    const result = await userService.update(userId, req.body, req.user!, req.file)
    res.status(result.statusCode).json(result)
  }

  public deleteUser = async (req: Request, res: Response) => {
    const rawUserId = req.params.userId
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
    const result = await userService.delete(userId, req.user!)
    res.status(result.statusCode).json(result)
  }
}

export const userController = new UserController()
