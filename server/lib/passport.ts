import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import { prisma } from './prisma'
import type { JwtPayload } from '../middleware/jwt'

const FRONTEND_URL = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173'

function getOAuthCallbackUrl(provider: string): string {
  const port = process.env.PORT || 3001
  const base = process.env.API_BASE_URL || `http://localhost:${port}`
  return `${base.replace(/\/$/, '')}/api/auth/${provider}/callback`
}

export function configurePassport(signToken: (payload: JwtPayload) => string): void {
  const handleOAuthUser = async (
    provider: string,
    profile: { id: string; emails?: Array<{ value: string }>; username?: string }
  ) => {
    const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.local`
    const providerId = profile.id
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { providerId, provider }
        ]
      }
    })

    if (existing) {
      return existing
    }

    return prisma.user.create({
      data: {
        email: email.toLowerCase(),
        provider,
        providerId,
        password: null
      }
    })
  }

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: getOAuthCallbackUrl('google')
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const user = await handleOAuthUser('google', profile as { id: string; emails?: Array<{ value: string }> })
            done(null, user)
          } catch (err) {
            done(err as Error, undefined)
          }
        }
      )
    )
  }

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: getOAuthCallbackUrl('github'),
          scope: ['user:email']
        },
        async (_accessToken: string, _refreshToken: string, profile: { id: string; emails?: Array<{ value: string }> }, done: (err: Error | null, user?: unknown) => void) => {
          try {
            const user = await handleOAuthUser('github', profile)
            done(null, user)
          } catch (err) {
            done(err as Error, undefined)
          }
        }
      )
    )
  }
}

export function getOAuthRedirectUrl(token: string): string {
  return `${FRONTEND_URL}/login?token=${encodeURIComponent(token)}`
}

export function getOAuthErrorRedirectUrl(error: string): string {
  return `${FRONTEND_URL}/login?error=${encodeURIComponent(error)}`
}
