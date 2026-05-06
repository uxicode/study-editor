<template>
  <div class="auth-page">
    <div class="auth-card">
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
        <a :href="googleAuthUrl" class="oauth-btn oauth-google">Google로 로그인</a>
        <a :href="githubAuthUrl" class="oauth-btn oauth-github">GitHub로 로그인</a>
      </div>
      <p class="auth-footer">
        이미 계정이 있으신가요?
        <RouterLink to="/login" class="auth-link">로그인</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const googleAuthUrl = computed(() => `${apiBaseUrl}/api/auth/google`)
const githubAuthUrl = computed(() => `${apiBaseUrl}/api/auth/github`)

async function handleSubmit() {
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
    await authStore.register(email.value.trim(), password.value)
    router.push('/')
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
  } finally {
    isLoading.value = false
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
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
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
