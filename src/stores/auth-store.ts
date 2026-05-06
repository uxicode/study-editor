import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/auth.service'
import { getAuthToken, setAuthToken } from '@/services/api-service'
import type { AuthUser } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const accessToken = computed(() => getAuthToken())

  async function login(email: string, password: string): Promise<void> {
    const data = await authService.login(email, password)
    if (data.success && data.user) {
      user.value = data.user
    } else {
      throw new Error('로그인에 실패했습니다.')
    }
  }

  async function register(email: string, password: string): Promise<void> {
    const data = await authService.register(email, password)
    if (data.success && data.user) {
      user.value = data.user
    } else {
      throw new Error('회원가입에 실패했습니다.')
    }
  }

  function logout(): void {
    authService.logout()
    user.value = null
  }

  async function initAuth(): Promise<void> {
    if (isInitialized.value) return
    isInitialized.value = true

    const token = getAuthToken()
    if (!token) return

    const fetchedUser = await authService.fetchMe()
    if (fetchedUser) {
      user.value = fetchedUser
    } else {
      authService.logout()
    }
  }

  async function setTokenAndFetchUser(token: string): Promise<void> {
    setAuthToken(token)
    const fetchedUser = await authService.fetchMe()
    if (fetchedUser) {
      user.value = fetchedUser
    } else {
      authService.logout()
    }
  }

  return {
    user,
    isAuthenticated,
    accessToken,
    isInitialized,
    login,
    register,
    logout,
    initAuth,
    setTokenAndFetchUser
  }
})
