import { supabase } from '@/lib/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
}

/** 회원가입 결과. 이메일 인증이 활성화된 경우 session 은 null 이고 needsEmailVerification === true. */
export interface RegisterResult {
  user: AuthUser | null
  needsEmailVerification: boolean
}

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user || !user.email) return null
  return { id: user.id, email: user.email }
}

/** 이메일 인증 링크 클릭 시 사용자가 도착할 프론트 URL */
function emailRedirectUrl(): string {
  return `${window.location.origin}/auth/callback`
}

export async function register(email: string, password: string): Promise<RegisterResult> {
  console.log('[auth.service] supabase.auth.signUp ->', { email, redirect: emailRedirectUrl() })
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: emailRedirectUrl() }
  })
  console.log('[auth.service] signUp response:', { data, error })
  if (error) throw new Error(error.message)

  const user = toAuthUser(data.user)
  // Supabase 가 session 을 즉시 만들었으면 이메일 인증이 꺼진 상태 → 바로 로그인
  // session 이 없고 user 만 반환되면 인증 메일이 발송된 상태
  const needsEmailVerification = !data.session && !!data.user
  return { user, needsEmailVerification }
}

/** 이메일 인증 메일을 재발송한다. */
export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: emailRedirectUrl() }
  })
  if (error) throw new Error(error.message)
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  const user = toAuthUser(data.user)
  if (!user) throw new Error('로그인에 실패했습니다.')
  return user
}

export async function loginWithOAuth(provider: Provider): Promise<void> {
  const redirectTo = `${window.location.origin}/login`
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo }
  })
  if (error) throw new Error(error.message)
}

export async function fetchMe(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) return null
  return toAuthUser(data.user)
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}
