import { supabase } from '@/lib/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
}

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user || !user.email) return null
  return { id: user.id, email: user.email }
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)
  const user = toAuthUser(data.user)
  if (!user) throw new Error('회원가입에 실패했습니다.')
  return user
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
