import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LearningPage from '@/views/LearningPage.vue'
import LoginPage from '@/views/LoginPage.vue'
import RegisterPage from '@/views/RegisterPage.vue'
import AuthCallbackPage from '@/views/AuthCallbackPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Learning',
    component: LearningPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallbackPage,
    meta: { requiresAuth: false }
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
