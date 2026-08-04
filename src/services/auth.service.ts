import { db, type UserEntity } from '@/lib/db'

export interface AuthUser {
  id: string
  email: string
}

export interface RegisterResult {
  user: AuthUser | null
  needsEmailVerification: boolean
}

export type Provider = 'google' | 'github'

const CURRENT_SESSION_KEY = 'study_editor_session'

function generateId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

function saveSessionToStorage(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY)
  }
}

function getSessionFromStorage(): AuthUser | null {
  const saved = localStorage.getItem(CURRENT_SESSION_KEY)
  if (!saved) return null
  try {
    return JSON.parse(saved)
  } catch {
    return null
  }
}

export async function register(email: string, password: string): Promise<RegisterResult> {
  const normalizedEmail = email.trim().toLowerCase()
  
  const existingUser = await db.users.where('email').equals(normalizedEmail).first()
  if (existingUser) {
    throw new Error('이미 가입된 이메일 주소입니다.')
  }

  const newUser: UserEntity = {
    id: generateId(),
    email: normalizedEmail,
    passwordHash: password, // 로컬 IndexedDB 저장용
    createdAt: new Date().toISOString()
  }

  await db.users.add(newUser)

  const authUser: AuthUser = { id: newUser.id, email: newUser.email }

  // 로컬 세션 저장
  await db.sessions.clear()
  await db.sessions.add({
    id: generateId(),
    userId: authUser.id,
    email: authUser.email,
    createdAt: new Date().toISOString()
  })
  saveSessionToStorage(authUser)

  return {
    user: authUser,
    needsEmailVerification: false
  }
}

export async function resendVerificationEmail(_email: string): Promise<void> {
  // 로컬 DB 모드에서는 이메일 인증이 필요 없습니다.
  return Promise.resolve()
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await db.users.where('email').equals(normalizedEmail).first()
  if (!user) {
    throw new Error('등록되지 않은 이메일이거나 비밀번호가 올바르지 않습니다.')
  }

  if (user.passwordHash !== password) {
    throw new Error('비밀번호가 올바르지 않습니다.')
  }

  const authUser: AuthUser = { id: user.id, email: user.email }

  await db.sessions.clear()
  await db.sessions.add({
    id: generateId(),
    userId: authUser.id,
    email: authUser.email,
    createdAt: new Date().toISOString()
  })
  saveSessionToStorage(authUser)

  return authUser
}

export async function loginWithOAuth(provider: Provider): Promise<void> {
  const oauthEmail = `${provider}_user@local.app`
  let user = await db.users.where('email').equals(oauthEmail).first()

  if (!user) {
    user = {
      id: generateId(),
      email: oauthEmail,
      passwordHash: 'oauth_dummy_pass',
      createdAt: new Date().toISOString()
    }
    await db.users.add(user)
  }

  const authUser: AuthUser = { id: user.id, email: user.email }

  await db.sessions.clear()
  await db.sessions.add({
    id: generateId(),
    userId: authUser.id,
    email: authUser.email,
    createdAt: new Date().toISOString()
  })
  saveSessionToStorage(authUser)
}

export async function fetchMe(): Promise<AuthUser | null> {
  const session = await db.sessions.toCollection().first()
  if (session) {
    const authUser = { id: session.userId, email: session.email }
    saveSessionToStorage(authUser)
    return authUser
  }

  const fallbackSession = getSessionFromStorage()
  if (fallbackSession) {
    return fallbackSession
  }

  return null
}

export async function getSession(): Promise<AuthUser | null> {
  return fetchMe()
}

export async function logout(): Promise<void> {
  await db.sessions.clear()
  saveSessionToStorage(null)
}
