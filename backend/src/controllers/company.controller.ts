import type { Request, Response } from 'express'
import { companyService } from '../services'

class CompanyController {
  public getCompanies = async (_req: Request, res: Response) => {
    const result = await companyService.findAll()
    res.status(result.statusCode).json(result)
  }

  public createCompany = async (req: Request, res: Response) => {
    const { name, code, icon } = req.body as {
      name: string
      code: string
      icon?: string
    }

    const result = await companyService.create({ name, code, icon })
    res.status(result.statusCode).json(result)
  }
}

export const companyController = new CompanyController()
