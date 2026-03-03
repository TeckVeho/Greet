import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { adminMiddleware } from '../middleware/admin.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { errorMiddleware } from '../middleware/error.middleware'
import { companyController } from '../controllers/company.controller'
import { companySchema } from '../validators/company.validator'

const router = Router()

// 全ての company API は認証 + admin ロールが必要
router.use(authMiddleware)

router.get('/', adminMiddleware, companyController.getCompanies)

router.post(
  '/',
  adminMiddleware,
  validateBody(companySchema),
  companyController.createCompany,
)

router.use(errorMiddleware)

export { router as companyRouter }

