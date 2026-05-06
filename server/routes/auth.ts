import { Router, type Request, type Response } from 'express'
import passport from 'passport'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { jwtAuth, type JwtPayload } from '../middleware/jwt'
import { configurePassport, getOAuthRedirectUrl, getOAuthErrorRedirectUrl } from '../lib/passport'
import { badRequest, conflict, internalError, notFound, ok, serviceUnavailable, unauthorized } from '../utils/response'

const router = Router()
const JWT_EXPIRES_IN = '7d'

function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET이 설정되지 않았습니다.')
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRES_IN })
}

configurePassport(signToken)

/**
 * POST /api/auth/register
 * Body: { email: string, password: string }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return badRequest(res, '이메일과 비밀번호가 필요합니다.')
    }

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || password.length < 6) {
      return badRequest(res, '이메일을 입력하고 비밀번호는 6자 이상이어야 합니다.')
    }

    const existing = await prisma.user.findUnique({ where: { email: trimmedEmail } })
    if (existing) {
      return conflict(res, '이미 사용 중인 이메일입니다.')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: passwordHash,
        provider: 'email'
      }
    })

    const token = signToken({ userId: user.id, email: user.email })
    return ok(res, {
      accessToken: token,
      user: { id: user.id, email: user.email }
    })
  } catch (error) {
    console.error('회원가입 실패:', error)
    return internalError(res, error)
  }
})

/**
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return badRequest(res, '이메일과 비밀번호가 필요합니다.')
    }

    const trimmedEmail = email.trim().toLowerCase()
    const user = await prisma.user.findUnique({ where: { email: trimmedEmail } })

    if (!user) {
      return notFound(res, '등록된 이메일이 아닙니다.')
    }

    if (!user.password) {
      return badRequest(res, '이 이메일은 소셜 로그인으로 가입되었습니다.')
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return unauthorized(res, '비밀번호가 올바르지 않습니다.')
    }

    const token = signToken({ userId: user.id, email: user.email })
    return ok(res, {
      accessToken: token,
      user: { id: user.id, email: user.email }
    })
  } catch (error) {
    console.error('로그인 실패:', error)
    return internalError(res, error)
  }
})

/**
 * GET /api/auth/me
 * JWT 필요
 */
router.get('/me', jwtAuth, async (req: Request, res: Response) => {
  try {
    const { userId } = req.authUser!
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    })

    if (!user) {
      return notFound(res, '사용자를 찾을 수 없습니다.')
    }

    return ok(res, { user })
  } catch (error) {
    console.error('사용자 조회 실패:', error)
    return internalError(res, error)
  }
})

/**
 * GET /api/auth/google
 * Google OAuth 시작
 */
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return serviceUnavailable(res, 'Google 로그인이 설정되지 않았습니다.')
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next)
})

/**
 * GET /api/auth/google/callback 확인 후 리디렉션
 * 사용자 정보 확인 후 JWT 토큰 발급 및 리디렉션
 */
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: Error | null, user?: { id: string; email: string }) => {
    if (err) {
      console.error('Google OAuth 실패:', err)
      res.redirect(getOAuthErrorRedirectUrl(err.message))
      return
    }
    if (!user) {
      res.redirect(getOAuthErrorRedirectUrl('사용자 정보를 가져올 수 없습니다'))
      return
    }
    const token = signToken({ userId: user.id, email: user.email })
    res.redirect(getOAuthRedirectUrl(token))
  })(req, res, next)
})

/**
 * GET /api/auth/github
 * GitHub OAuth 시작
 */
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID) {
    return serviceUnavailable(res, 'GitHub 로그인이 설정되지 않았습니다.')
  }
  passport.authenticate('github', { scope: ['user:email'], session: false })(req, res, next)
})

/**
 * GET /api/auth/github/callback
 */
router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err: Error | null, user?: { id: string; email: string }) => {
    if (err) {
      console.error('GitHub OAuth 실패:', err)
      res.redirect(getOAuthErrorRedirectUrl(err.message))
      return
    }
    if (!user) {
      res.redirect(getOAuthErrorRedirectUrl('사용자 정보를 가져올 수 없습니다'))
      return
    }
    const token = signToken({ userId: user.id, email: user.email })
    res.redirect(getOAuthRedirectUrl(token))
  })(req, res, next)
})

export default router
