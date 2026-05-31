<template>
  <div class="auth-callback">
    <div class="callback-card">
      <template v-if="status === 'pending'">
        <div class="spinner" aria-hidden="true" />
        <h1 class="callback-title">이메일 인증 처리 중...</h1>
        <p class="callback-message">잠시만 기다려 주세요.</p>
      </template>

      <template v-else-if="status === 'success'">
        <div class="icon icon-success" aria-hidden="true">✓</div>
        <h1 class="callback-title">인증 완료!</h1>
        <p class="callback-message">곧 학습 페이지로 이동합니다...</p>
      </template>

      <template v-else>
        <div class="icon icon-error" aria-hidden="true">!</div>
        <h1 class="callback-title">인증에 실패했습니다</h1>
        <p class="callback-message">{{ errorMessage }}</p>
        <RouterLink to="/login" class="callback-link">로그인 페이지로 돌아가기</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'

const router = useRouter()
const authStore = useAuthStore()

type CallbackStatus = 'pending' | 'success' | 'error'
const status = ref<CallbackStatus>('pending')
const errorMessage = ref('')

let timeoutId: ReturnType<typeof setTimeout> | null = null

const stopWatch = watch(
  () => authStore.isAuthenticated,
  (authed) => {
    if (authed) finishSuccess()
  }
)

onMounted(async () => {
  // URL hash 에 인증 에러가 직접 포함된 경우 (예: 만료된 링크)
  const hash = window.location.hash || ''
  const errMatch = hash.match(/error_description=([^&]+)/)
  if (errMatch) {
    status.value = 'error'
    errorMessage.value = decodeURIComponent(errMatch[1]).replace(/\+/g, ' ')
    return
  }

  // supabase 클라이언트(detectSessionInUrl) 가 토큰을 추출할 때까지 기다린다.
  await authStore.initAuth()
  if (authStore.isAuthenticated) {
    finishSuccess()
    return
  }

  // onAuthStateChange 콜백이 약간 늦게 도착할 수 있으므로 10초 timeout 을 둔다.
  timeoutId = setTimeout(() => {
    if (status.value === 'pending') {
      status.value = 'error'
      errorMessage.value =
        '인증 링크가 만료되었거나 유효하지 않습니다. 다시 시도해 주세요.'
    }
  }, 10_000)
})

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId)
  stopWatch()
})

function finishSuccess() {
  status.value = 'success'
  if (timeoutId) clearTimeout(timeoutId)
  setTimeout(() => router.replace('/'), 1200)
}
</script>

<style scoped lang="scss">
.auth-callback {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.callback-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 12px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  :global(.dark) & {
    background: #1f2937;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }
}

.callback-title {
  font-size: 22px;
  font-weight: 700;
  margin: 16px 0 8px;
  color: #1f2937;

  :global(.dark) & {
    color: #f3f4f6;
  }
}

.callback-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;

  :global(.dark) & {
    color: #d1d5db;
  }
}

.callback-link {
  display: inline-block;
  margin-top: 20px;
  color: #2563eb;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: white;
}

.icon-success {
  background: #10b981;
}

.icon-error {
  background: #dc2626;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto;
  border: 4px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
