<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Interactive Backend Learning Platform
        </h1>
        <div class="header-actions">
          <template v-if="authStore.isAuthenticated">
            <span class="user-email">{{ authStore.user?.email }}</span>
            <button class="btn-secondary text-sm" @click="handleLogout">
              로그아웃
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="auth-header-btn">로그인</RouterLink>
            <RouterLink to="/register" class="auth-header-btn">회원가입</RouterLink>
          </template>
          <button
            class="info-button"
            @click="showInfoModal = true"
            title="코드 분석 모드 정보"
          >
            ℹ️
          </button>
          <button
            class="btn-secondary text-sm"
            @click="toggleDarkMode"
          >
            {{ isDarkMode ? '☀️ Light' : '🌙 Dark' }}
          </button>
        </div>
      </div>
    </header>

    <div class="app-body">
      <!-- LNB (Left Navigation Bar) - 마우스 오버/아웃 자동 토글 사이드바 -->
      <aside
        v-if="isLearningPage"
        class="app-sidebar"
        :class="{ collapsed: isSidebarCollapsed }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="sidebar-menu">
          <button
            v-for="curr in CURRICULUMS"
            :key="curr.id"
            class="sidebar-item"
            :class="{ active: activeCurriculumId === curr.id }"
            @click="handleCurriculumChange(curr.id)"
            :title="isSidebarCollapsed ? `${curr.title} (${getCurriculumProgressText(curr)})` : ''"
          >
            <span class="item-icon">{{ curr.icon }}</span>
            <span v-if="!isSidebarCollapsed" class="item-title">{{ curr.title }}</span>
            <span v-if="!isSidebarCollapsed" class="item-badge">{{ getCurriculumProgressText(curr) }}</span>
          </button>
        </div>

        <!-- 사이드바 푸터 - 설정 기어 아이콘 (Supabase 스타일) -->
        <div class="sidebar-footer">
          <div class="footer-item" title="설정">
            <span class="item-icon">⚙️</span>
            <span v-if="!isSidebarCollapsed" class="item-title">설정</span>
          </div>
        </div>
      </aside>

      <div class="app-content-area">
        <StepNavigation v-if="isLearningPage" />

        <main class="app-main">
          <RouterView />
        </main>
      </div>
    </div>

    <!-- 정보 모달 -->
    <InfoModal
      :is-open="showInfoModal"
      @close="showInfoModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth-store'
import InfoModal from '@/components/ui/InfoModal.vue'
import StepNavigation from '@/components/learning-environment/StepNavigation.vue'
import { useCurriculum } from '@/composables/use-curriculum'
import { CURRICULUMS } from '@/data/curriculum-steps'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const isDarkMode = ref(false)
const showInfoModal = ref(false)

// 기본적으로는 컴팩트한 아이콘 모드로 렌더링
const isSidebarCollapsed = ref(true)

const { activeCurriculumId, changeCurriculum, userProgress } = useCurriculum()

const isLearningPage = computed(() => route.name === 'Learning')

function handleCurriculumChange(curriculumId: any) {
  changeCurriculum(curriculumId)
}

function getCurriculumProgressText(curr: any): string {
  const completed = curr.steps.filter((s: any) => userProgress.value.completedSteps.includes(s.id)).length
  return `${completed}/${curr.steps.length}`
}

// 마우스 오버 시 전체 확장
function handleMouseEnter() {
  isSidebarCollapsed.value = false
}

// 마우스 아웃 시 아이콘 모드로 축소
function handleMouseLeave() {
  isSidebarCollapsed.value = true
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
  }
  
  localStorage.setItem('darkMode', String(isDarkMode.value))
}

onMounted(async () => {
  await authStore.initAuth()

  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  }
})
</script>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background-color: #f5f5f5;

  :global(.dark) & {
    background-color: #0f172a;
  }
}

.app-header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 30;

  :global(.dark) & {
    background: #1f2937;
    border-bottom-color: #374151;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.user-email {
  font-size: 14px;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.auth-header-btn {
  font-size: 14px;
  font-weight: 500;
  color: #2563eb;
  text-decoration: none;
  padding: 6px 12px;

  &:hover {
    text-decoration: underline;
  }
}

.info-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    border-color: #0ea5e9;
    transform: scale(1.05);

    :global(.dark) & {
      background: #374151;
    }
  }

  :global(.dark) & {
    border-color: #374151;
  }
}

/* Supabase 스타일 LNB 전체 레이아웃 */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 240px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  :global(.dark) & {
    background: #1e293b;
    border-right-color: #374151;
  }
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 12px;
  flex: 1;
  overflow-x: hidden;

  .collapsed & {
    padding: 16px 8px;
    align-items: center;
  }
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  .collapsed & {
    justify-content: center;
    padding: 10px;
    width: 44px;
    height: 44px;
    border-radius: 8px;
  }

  &:hover {
    background: #f3f4f6;

    :global(.dark) & {
      background: #334155;
    }
  }

  &.active {
    background: #f1f5f9;
    border-color: #e2e8f0;

    :global(.dark) & {
      background: #334155;
      border-color: #475569;
    }
  }
}

.item-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.item-title {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  flex: 1;

  .sidebar-item.active & {
    color: #0f172a;
    font-weight: 700;

    :global(.dark) & {
      color: #38bdf8;
    }
  }

  :global(.dark) & {
    color: #cbd5e1;
  }
}

.item-badge {
  font-size: 10px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 600;

  .sidebar-item.active & {
    background: #e2e8f0;
    color: #0f172a;

    :global(.dark) & {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
    }
  }

  :global(.dark) & {
    background: #1e293b;
    color: #94a3b8;
  }
}

/* 사이드바 푸터 및 기어 설정 아이콘 */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;

  .collapsed & {
    padding: 12px 8px;
    align-items: center;
  }

  :global(.dark) & {
    border-top-color: #374151;
  }
}

.footer-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  color: #64748b;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;

  .collapsed & {
    justify-content: center;
    padding: 10px;
    width: 44px;
    height: 44px;
  }

  &:hover {
    background: #f3f4f6;
    color: #1e293b;

    :global(.dark) & {
      background: #334155;
      color: #f8fafc;
    }
  }

  :global(.dark) & {
    color: #94a3b8;
  }
}

.app-content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}
</style>
