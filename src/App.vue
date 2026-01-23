<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Interactive Backend Learning Platform
        </h1>
        <div class="header-actions">
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

    <main class="app-main">
      <LearningEnvironment />
    </main>

    <!-- 정보 모달 -->
    <InfoModal
      :is-open="showInfoModal"
      @close="showInfoModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LearningEnvironment from '@/components/learning-environment/LearningEnvironment.vue'
import InfoModal from '@/components/ui/InfoModal.vue'

const isDarkMode = ref(false)
const showInfoModal = ref(false)

function toggleDarkMode() {
  isDarkMode.value = !isDarkMode.value
  
  // html과 body에 모두 dark 클래스 적용
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
    document.body.classList.remove('dark')
  }
  
  localStorage.setItem('darkMode', String(isDarkMode.value))
}

onMounted(() => {
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

.app-main {
  flex: 1;
  overflow: hidden;
  padding: 16px;
}
</style>
