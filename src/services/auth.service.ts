import { apiService, setAuthToken } from '@/services/api-service'

export interface AuthUser {
  id: string
  email: string
}

export interface LoginResponse {
  success: boolean
  accessToken: string
  user: AuthUser
}

export interface MeResponse {
  success: boolean
  user: AuthUser
}

export async function register(email: string, password: string): Promise<LoginResponse> {
  const data = await apiService.post<LoginResponse>('/api/auth/register', { email, password })
  if (data.success && data.accessToken) {
    setAuthToken(data.accessToken)
  }
  return data
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiService.post<LoginResponse>('/api/auth/login', { email, password })
  if (data.success && data.accessToken) {
    setAuthToken(data.accessToken)
  }
  return data
}

export async function fetchMe(): Promise<AuthUser | null> {
  try {
    const data = await apiService.get<MeResponse>('/api/auth/me')
    return data.success ? data.user : null
  } catch {
    return null
  }
}

export function logout(): void {
  setAuthToken(null)
}
