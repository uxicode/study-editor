import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as authService from '@/services/auth.service'
import type { AuthUser, RegisterResult } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string): Promise<void> {
    user.value = await authService.login(email, password)
  }

  async function register(email: string, password: string): Promise<RegisterResult> {
    const result = await authService.register(email, password)
    if (result.user) {
      user.value = result.user
    }
    return result
  }

  async function logout(): Promise<void> {
    await authService.logout()
    user.value = null
  }

  async function initAuth(): Promise<void> {
    if (isInitialized.value) return
    isInitialized.value = true

    const fetchedUser = await authService.fetchMe()
    user.value = fetchedUser
  }

  return {
    user,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout,
    initAuth
  }
})
