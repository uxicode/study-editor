<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">로그인</h1>
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">이메일</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="example@email.com"
            autocomplete="email"
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="6자 이상"
            autocomplete="current-password"
          />
        </div>
        <p v-if="justRegistered" class="success-message">
          회원가입이 완료되었습니다. 로그인 해주세요.
        </p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <p v-if="emailUnconfirmed" class="info-message">
          이메일 인증이 완료되지 않았습니다.
          <button
            type="button"
            class="inline-link-btn"
            :disabled="isResending"
            @click="handleResend"
          >
            {{ isResending ? '재전송 중...' : '인증 메일 다시 보내기' }}
          </button>
        </p>
        <p v-if="resendMessage" class="resend-message">{{ resendMessage }}</p>
        <button type="submit" class="btn-primary auth-submit" :disabled="isLoading">
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
      <div class="auth-divider">또는</div>
      <div class="oauth-buttons">
        <button type="button" class="oauth-btn oauth-google" @click="handleOAuth('google')">
          Google로 로그인
        </button>
        <button type="button" class="oauth-btn oauth-github" @click="handleOAuth('github')">
          GitHub로 로그인
        </button>
      </div>
      <p class="auth-footer">
        계정이 없으신가요?
        <RouterLink to="/register" class="auth-link">회원가입</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Provider } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth-store'
import { loginWithOAuth, resendVerificationEmail } from '@/services/auth.service'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const isResending = ref(false)
const resendMessage = ref('')

const emailUnconfirmed = computed(() =>
  /email\s*not\s*confirmed|confirm\s*your\s*email/i.test(errorMessage.value)
)
const justRegistered = computed(() => route.query.registered === '1')

onMounted(async () => {
  await authStore.initAuth()
  if (authStore.isAuthenticated) {
    router.replace('/')
  }
})

watch(
  () => authStore.isAuthenticated,
  (authed) => {
    if (authed) router.replace('/')
  }
)

async function handleSubmit() {
  errorMessage.value = ''
  resendMessage.value = ''
  isLoading.value = true
  try {
    await authStore.login(email.value.trim(), password.value)
    router.push('/')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '로그인에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

async function handleResend() {
  errorMessage.value = ''
  resendMessage.value = ''
  if (!email.value.trim()) {
    errorMessage.value = '이메일을 먼저 입력해 주세요.'
    return
  }
  isResending.value = true
  try {
    await resendVerificationEmail(email.value.trim())
    resendMessage.value = '인증 메일을 다시 발송했습니다.'
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '재전송에 실패했습니다.'
  } finally {
    isResending.value = false
  }
}

async function handleOAuth(provider: Provider) {
  errorMessage.value = ''
  try {
    await loginWithOAuth(provider)
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'OAuth 로그인에 실패했습니다.'
  }
}
</script>

<style scoped lang="scss">
.auth-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  :global(.dark) & {
    background: #1f2937;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: #1f2937;

  :global(.dark) & {
    color: #f3f4f6;
  }
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;

    :global(.dark) & {
      color: #d1d5db;
    }
  }

  input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;

    :global(.dark) & {
      background: #374151;
      border-color: #4b5563;
      color: #f3f4f6;
    }
  }
}

.error-message {
  color: #dc2626;
  font-size: 14px;
}

.info-message {
  font-size: 13px;
  color: #92400e;
  background: #fef3c7;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.5;

  :global(.dark) & {
    background: #422006;
    color: #fde68a;
  }
}

.inline-link-btn {
  background: none;
  border: none;
  padding: 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: progress;
  }
}

.resend-message {
  color: #059669;
  font-size: 13px;
}

.success-message {
  color: #065f46;
  background: #d1fae5;
  font-size: 13px;
  padding: 10px 12px;
  border-radius: 8px;

  :global(.dark) & {
    background: #064e3b;
    color: #a7f3d0;
  }
}

.auth-submit {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
}

.auth-divider {
  margin: 24px 0 16px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.oauth-btn {
  display: block;
  width: 100%;
  text-align: center;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

.oauth-google {
  background: #4285f4;
  color: white;
}

.oauth-github {
  background: #24292e;
  color: white;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.auth-link {
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
