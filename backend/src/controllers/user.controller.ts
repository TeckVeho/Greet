import { Request, Response } from 'express'
import { userService } from '../services/user.service'

class UserController {
  public getUsers = async (req: Request, res: Response) => {
    const result = await userService.findAll()
    res.status(result.statusCode).json(result)
  }

  public getUserById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)
    const result = await userService.findById(String(id))
    res.status(result.statusCode).json(result)
  }

  public createUser = async (req: Request, res: Response) => {
    const result = await userService.create(req.body)
    res.status(result.statusCode).json(result)
  }

  public updateUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)
    const result = await userService.update(String(id), req.body)
    res.status(result.statusCode).json(result)
  }

  public deleteUser = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string)
    const result = await userService.delete(String(id))
    res.status(result.statusCode).json(result)
  }
}

export const userController = new UserController()
