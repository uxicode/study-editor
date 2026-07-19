<template>
  <div class="step-navigation-container">
    <!-- Collapsed Top Bar -->
    <div class="top-bar">
      <div class="left-section">
        <span class="week-badge">
          {{ currentWeekName }}
        </span>
        <h2 class="current-title" v-if="currentStep">
          Step {{ currentStepInWeekNumber }}. {{ cleanTitle(currentStep.title) }}
        </h2>
        <span v-if="isCurrentStepCompleted" class="status-badge completed">완료됨</span>
        <span v-else class="status-badge active">진행 중</span>
      </div>

      <div class="center-section">
        <div class="progress-wrapper">
          <span class="progress-text">진척도: {{ completedCount }} / {{ totalCount }}</span>
          <div class="progress-bar-bg">
            <div
              class="progress-bar-fill"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
          <span class="progress-percent">{{ progressPercentage.toFixed(0) }}%</span>
        </div>
      </div>

      <div class="right-section">
        <button class="toggle-button" @click="toggleOpen">
          <span>{{ isOpen ? '커리큘럼 닫기' : '커리큘럼 전체 보기' }}</span>
          <svg
            class="chevron-icon"
            :class="{ 'rotate-180': isOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Dropdown Panel -->
    <transition name="slide-fade">
      <div v-if="isOpen" class="roadmap-panel">
        <div class="roadmap-grid" :style="{ '--col-count': weeks.length }">
          <div
            v-for="(week, weekIdx) in weeks"
            :key="weekIdx"
            class="week-column"
          >
            <div class="week-header">
              <span class="week-title">{{ week.title }}</span>
              <span class="week-progress">
                {{ getWeekCompletedCount(week.steps) }} / {{ week.steps.length }} 완료
              </span>
            </div>

            <div class="steps-list">
              <button
                v-for="step in week.steps"
                :key="step.id"
                class="step-card"
                :class="{
                  active: isStepActive(step.id),
                  completed: isStepCompleted(step.id),
                  locked: isStepLocked(step.id)
                }"
                @click="handleStepClick(step)"
              >
                <div class="step-card-left">
                  <span class="step-num">Step {{ getStepIndexInWeek(step.id) }}</span>
                  <span class="step-name">{{ cleanTitle(step.title) }}</span>
                </div>

                <div class="step-card-right">
                  <!-- Completed Icon -->
                  <svg
                    v-if="isStepCompleted(step.id)"
                    class="status-icon success-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>

                  <!-- Active/Current Icon -->
                  <span v-else-if="isStepActive(step.id)" class="status-pulse-badge">
                    <span class="pulse-dot"></span>
                    진행 중
                  </span>

                  <!-- Locked Icon -->
                  <svg
                    v-else-if="isStepLocked(step.id)"
                    class="status-icon lock-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurriculum } from '@/composables/use-curriculum'
import { useAuthStore } from '@/stores/auth-store'
import type { CurriculumStep } from '@/types/curriculum'

const router = useRouter()
const authStore = useAuthStore()
const {
  currentStep,
  allSteps,
  userProgress,
  loadStep
} = useCurriculum()

const isOpen = ref(false)

function toggleOpen() {
  isOpen.value = !isOpen.value
}

// 주차명 매핑 맵
const weekTitlesMap: Record<string, string> = {
  'week-1': '1주차: Fastify + TypeScript',
  'week-2': '2주차: MySQL DDL',
  'week-3': '3주차: Prisma ORM & 아키텍처',
  'week-4': '4주차: 트랜잭션 & 성능 최적화',
  'week-5': '1주차: 정규식 & 데이터 처리',
  'week-6': '1주차: 필수 알고리즘',
  'week-7': '1주차: Next.js & React Hooks',
  'week-8': '2주차: 전역 상태 관리',
  'week-9': '3주차: 로그인 및 고급 인증'
}

// 활성 커리큘럼의 스텝 동적 그룹화
const weeks = computed(() => {
  const groupsMap = new Map<string, { weekNum: number; title: string; steps: CurriculumStep[] }>()
  
  allSteps.value.forEach((step) => {
    const match = step.id.match(/^(week-\d+)/)
    if (!match) return
    const weekKey = match[1]
    
    if (!groupsMap.has(weekKey)) {
      const weekIndexInCurriculum = groupsMap.size + 1
      const title = weekTitlesMap[weekKey] || `${weekIndexInCurriculum}주차`
      groupsMap.set(weekKey, {
        weekNum: weekIndexInCurriculum,
        title,
        steps: []
      })
    }
    
    groupsMap.get(weekKey)!.steps.push(step)
  })

  return Array.from(groupsMap.values())
})

const completedCount = computed(() => {
  // 현재 활성화된 커리큘럼 스텝 중 완료한 스텝 수
  return allSteps.value.filter(s => userProgress.value.completedSteps.includes(s.id)).length
})

const totalCount = computed(() => allSteps.value.length)

const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0
  return (completedCount.value / totalCount.value) * 100
})

const currentWeekNumber = computed(() => {
  if (!currentStep.value) return 1
  const id = currentStep.value.id
  const wIndex = weeks.value.findIndex(w => w.steps.some(s => s.id === id))
  return wIndex >= 0 ? wIndex + 1 : 1
})

const currentWeekName = computed(() => {
  return `${currentWeekNumber.value}주차`
})

const currentStepInWeekNumber = computed(() => {
  if (!currentStep.value) return ''
  return getStepIndexInWeek(currentStep.value.id)
})

const isCurrentStepCompleted = computed(() => {
  if (!currentStep.value) return false
  return userProgress.value.completedSteps.includes(currentStep.value.id)
})

function getStepIndexInWeek(stepId: string): string {
  const parts = stepId.split('-')
  if (parts.length < 3) return ''
  const val = parts[2]
  if (val === 'final') return '종합'
  return val
}

function getWeekCompletedCount(steps: CurriculumStep[]): number {
  return steps.filter((s) => userProgress.value.completedSteps.includes(s.id)).length
}

function cleanTitle(title: string): string {
  return title.replace(/^\d+주차\s*·\s*/, '')
}

function isStepActive(stepId: string): boolean {
  return currentStep.value?.id === stepId
}

function isStepCompleted(stepId: string): boolean {
  return userProgress.value.completedSteps.includes(stepId)
}

function getActualWeekNum(stepId: string): number {
  const parts = stepId.split('-')
  if (parts.length >= 2) {
    return Number(parts[1])
  }
  return 1
}

function isStepLocked(stepId: string): boolean {
  const actualWeek = getActualWeekNum(stepId)
  // 기존 약속에 따라 2, 3, 4, 8, 9주차 스텝은 로그인 필요
  const requiresAuth = [2, 3, 4, 8, 9].includes(actualWeek)
  return requiresAuth && !authStore.isAuthenticated
}

async function handleStepClick(step: CurriculumStep) {
  if (isStepLocked(step.id)) {
    if (confirm('이 단계는 로그인이 필요합니다.\n로그인 페이지로 이동할까요?')) {
      isOpen.value = false
      router.push('/login')
    }
    return
  }

  // 스텝 로드
  await loadStep(step.id)
  isOpen.value = false
}
</script>

<style scoped lang="scss">
.step-navigation-container {
  position: relative;
  width: 100%;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  z-index: 40;

  :global(.dark) & {
    background: #1f2937;
    border-bottom-color: #374151;
  }
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 24px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.week-badge {
  display: inline-block;
  padding: 3px 8px;
  background: #f3f4f6;
  color: #4b5563;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;

  :global(.dark) & {
    background: #374151;
    color: #d1d5db;
  }
}

.current-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0;

  :global(.dark) & {
    color: #f9fafb;
  }
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;

  &.completed {
    background: #d1fae5;
    color: #065f46;

    :global(.dark) & {
      background: #064e3b;
      color: #a7f3d0;
    }
  }

  &.active {
    background: #dbeafe;
    color: #1e40af;

    :global(.dark) & {
      background: #1e3a8a;
      color: #93c5fd;
    }
  }
}

.center-section {
  display: flex;
  align-items: center;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-text {
  font-size: 11px;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.progress-bar-bg {
  width: 140px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;

  :global(.dark) & {
    background: #374151;
  }
}

.progress-bar-fill {
  height: 100%;
  background: #10b981;
  border-radius: 9999px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-percent {
  font-size: 11px;
  font-weight: 700;
  color: #10b981;
}

.right-section {
  display: flex;
  align-items: center;
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;

    :global(.dark) & {
      background: #2d3748;
      border-color: #4a5568;
    }
  }

  :global(.dark) & {
    border-color: #4b5563;
    color: #e5e7eb;
  }
}

.chevron-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}

/* Expanded panel */
.roadmap-panel {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  padding: 24px;
  box-sizing: border-box;
  z-index: 50;

  :global(.dark) & {
    background: rgba(31, 41, 55, 0.95);
    border-bottom-color: #374151;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
  }
}

.roadmap-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 20px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(min(2, var(--col-count, 4)), minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(var(--col-count, 4), minmax(0, 1fr));
  }
}

.week-column {
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  padding: 16px;

  :global(.dark) & {
    background: rgba(17, 24, 39, 0.4);
    border-color: rgba(55, 65, 81, 0.5);
  }
}

.week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;

  :global(.dark) & {
    border-bottom-color: #374151;
  }
}

.week-title {
  font-size: 12px;
  font-weight: 700;
  color: #111827;

  :global(.dark) & {
    color: #f3f4f6;
  }
}

.week-progress {
  font-size: 10px;
  font-weight: 500;
  color: #6b7280;

  :global(.dark) & {
    color: #9ca3af;
  }
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  :global(.dark) & {
    background: #1f2937;
    border-color: #374151;
  }

  &:hover:not(.locked) {
    transform: translateY(-1px);
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);

    :global(.dark) & {
      border-color: #4b5563;
      background: #253043;
    }
  }

  &.active {
    border-color: #3b82f6;
    background: #eff6ff;
    box-shadow: 0 0 0 1px #3b82f6;

    :global(.dark) & {
      border-color: #3b82f6;
      background: rgba(30, 58, 138, 0.3);
      box-shadow: 0 0 0 1px #3b82f6;
    }
  }

  &.completed {
    border-color: #a7f3d0;
    background: rgba(240, 253, 250, 0.5);

    :global(.dark) & {
      border-color: rgba(4, 120, 87, 0.4);
      background: rgba(4, 120, 87, 0.08);
    }
  }

  &.locked {
    opacity: 0.55;
    background: #f9fafb;
    border-color: #e5e7eb;
    cursor: not-allowed;

    :global(.dark) & {
      background: #111827;
      border-color: #1f2937;
    }
  }
}

.step-card-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.step-num {
  font-size: 9px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;

  .step-card.active & {
    color: #3b82f6;
  }

  .step-card.completed & {
    color: #10b981;
  }
}

.step-name {
  font-size: 11px;
  font-weight: 500;
  color: #4b5563;

  :global(.dark) & {
    color: #d1d5db;
  }

  .step-card.active & {
    color: #1e3a8a;
    font-weight: 600;

    :global(.dark) & {
      color: #93c5fd;
    }
  }

  .step-card.completed & {
    color: #065f46;

    :global(.dark) & {
      color: #a7f3d0;
    }
  }
}

.step-card-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.status-icon {
  width: 14px;
  height: 14px;

  &.success-icon {
    color: #10b981;
  }

  &.lock-icon {
    color: #9ca3af;
  }
}

.status-pulse-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #3b82f6;
  background: #dbeafe;
  padding: 2px 5px;
  border-radius: 4px;

  :global(.dark) & {
    background: #1e3a8a;
    color: #93c5fd;
  }
}

.pulse-dot {
  width: 5px;
  height: 5px;
  background: #3b82f6;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.9);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.9);
    opacity: 1;
  }
}

/* Animations */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-8px);
  opacity: 0;
}
</style>
