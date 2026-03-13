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
    // companyId is injected from the admin's JWT — client cannot supply it
    const result = await userService.create({
      ...req.body,
      companyId: req.user!.companyId,
    })
    res.status(result.statusCode).json(result)
  }

  public updateUser = async (req: Request, res: Response) => {
    const rawUserId = req.params.userId
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
    const result = await userService.update(userId, req.body, req.user!)
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
