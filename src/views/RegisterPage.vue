<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- 회원가입 폼 -->
      <template v-if="!verificationSent">
        <h1 class="auth-title">회원가입</h1>
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
              autocomplete="new-password"
            />
          </div>
          <div class="form-group">
            <label for="passwordConfirm">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              v-model="passwordConfirm"
              type="password"
              required
              placeholder="비밀번호 다시 입력"
              autocomplete="new-password"
            />
          </div>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          <button type="submit" class="btn-primary auth-submit" :disabled="isLoading">
            {{ isLoading ? '가입 중...' : '회원가입' }}
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
          이미 계정이 있으신가요?
          <RouterLink to="/login" class="auth-link">로그인</RouterLink>
        </p>
      </template>

      <!-- 이메일 인증 대기 화면 -->
      <template v-else>
        <h1 class="auth-title">📬 이메일을 확인해 주세요</h1>
        <p class="verify-message">
          <strong>{{ email }}</strong> 로 인증 메일을 보냈습니다.<br />
          메일함의 링크를 클릭하면 가입이 완료됩니다.
        </p>
        <p class="verify-hint">
          메일이 도착하지 않았나요? 스팸함도 한 번 확인해 보세요.
        </p>
        <p v-if="resendMessage" class="resend-message">{{ resendMessage }}</p>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        <button
          type="button"
          class="btn-secondary auth-submit"
          :disabled="isResending"
          @click="handleResend"
        >
          {{ isResending ? '재전송 중...' : '인증 메일 다시 보내기' }}
        </button>
        <RouterLink to="/login" class="auth-link verify-back-link">
          로그인 페이지로 돌아가기 →
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Provider } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/auth-store'
import { loginWithOAuth, resendVerificationEmail } from '@/services/auth.service'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const verificationSent = ref(false)
const isResending = ref(false)
const resendMessage = ref('')

async function handleSubmit() {
  console.log('[register] handleSubmit start', { email: email.value.trim() })
  errorMessage.value = ''
  if (password.value !== passwordConfirm.value) {
    errorMessage.value = '비밀번호가 일치하지 않습니다.'
    return
  }
  if (password.value.length < 6) {
    errorMessage.value = '비밀번호는 6자 이상이어야 합니다.'
    return
  }
  isLoading.value = true
  try {
    console.log('[register] before authStore.register')
    const result = await authStore.register(email.value.trim(), password.value)
    console.log('[register] after authStore.register, result:', result)
    if (result.needsEmailVerification) {
      verificationSent.value = true
      return
    }
    await authStore.logout()
    router.push({ path: '/login', query: { registered: '1' } })
  } catch (err) {
    console.error('[register] error:', err)
    errorMessage.value = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
  } finally {
    isLoading.value = false
  }
}

async function handleResend() {
  errorMessage.value = ''
  resendMessage.value = ''
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

.verify-message {
  font-size: 15px;
  line-height: 1.7;
  color: #374151;
  text-align: center;
  margin: 8px 0 16px;

  strong {
    color: #2563eb;
    word-break: break-all;
  }

  :global(.dark) & {
    color: #d1d5db;
  }
}

.verify-hint {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 16px;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.resend-message {
  color: #059669;
  font-size: 14px;
  text-align: center;
  margin: 8px 0;
}

.verify-back-link {
  display: block;
  text-align: center;
  margin-top: 16px;
  color: #2563eb;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
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
