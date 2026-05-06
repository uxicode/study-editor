import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { internalError, unauthorized } from '../utils/response'

export interface JwtPayload {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtPayload
    }
  }
}

export function jwtAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    unauthorized(res, '인증이 필요합니다.')
    return
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET이 설정되지 않았습니다.')
    internalError(res, new Error('서버 설정 오류'))
    return
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload
    req.authUser = decoded
    next()
  } catch {
    unauthorized(res, '유효하지 않은 토큰입니다.')
  }
}
