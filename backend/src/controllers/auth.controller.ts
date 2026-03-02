import type { Request, Response } from 'express'
import { login, getCurrentUser } from '../services/auth.service'

export async function loginController(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'メールアドレスとパスワードは必須です',
      },
    })
    return
  }

  const result = await login(email, password)
  if (!result) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'メールアドレスまたはパスワードが正しくありません',
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: {
      token: result.token,
      user: result.user,
    },
  })
}

export async function meController(req: Request, res: Response): Promise<void> {
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

  const user = await getCurrentUser(req.user.userId)
  if (!user) {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'ユーザーが見つかりません',
      },
    })
    return
  }

  res.status(200).json({
    success: true,
    data: user,
  })
}

export async function logoutController(req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: { message: 'ログアウトしました' },
  })
}

