import { ref, computed } from 'vue'
import type { CurriculumStep, UserProgress } from '@/types/curriculum'
import { CURRICULUM_STEPS, LEVEL_STEP_COUNTS } from '@/data/curriculum-steps'
import { useAuthStore } from '@/stores/auth-store'
import * as progressService from '@/services/progress.service'

const MAX_LEVEL = 4
type LevelKey = keyof typeof LEVEL_STEP_COUNTS

/** 레벨 1 ~ targetLevel 까지의 누적 스텝 수 */
function getCumulativeStepsThroughLevel(targetLevel: number): number {
  let sum = 0
  for (let level = 1; level <= targetLevel && level <= MAX_LEVEL; level++) {
    sum += LEVEL_STEP_COUNTS[level as LevelKey] ?? 0
  }
  return sum
}

const FIRST_STEP_ID = 'week-1-1'

const VALID_STEP_IDS = new Set(CURRICULUM_STEPS.map((s) => s.id))

/** 알 수 없는 step ID (이전 커리큘럼의 잔재 등) 를 안전하게 first step 으로 정규화한다. */
function normalizeStepId(stepId: string | undefined | null): string {
  if (stepId && VALID_STEP_IDS.has(stepId)) return stepId
  return FIRST_STEP_ID
}

function sanitizeProgress(input: UserProgress): UserProgress {
  return {
    completedSteps: (input.completedSteps ?? []).filter((id) => VALID_STEP_IDS.has(id)),
    currentStep: normalizeStepId(input.currentStep),
    attempts: input.attempts ?? {}
  }
}

const currentStepId = ref<string>('')
const userProgress = ref<UserProgress>({
  completedSteps: [],
  currentStep: FIRST_STEP_ID,
  attempts: {}
})

export function useCurriculum() {
  const isLoadingStep = ref(false)

  const currentStep = computed<CurriculumStep | null>(() => {
    return CURRICULUM_STEPS.find(step => step.id === currentStepId.value) || null
  })

  const allSteps = computed(() => CURRICULUM_STEPS)

  const currentStepIndex = computed(() => {
    return CURRICULUM_STEPS.findIndex(step => step.id === currentStepId.value)
  })

  const canGoNext = computed(() => {
    return userProgress.value.completedSteps.includes(currentStepId.value)
  })

  const canGoPrevious = computed(() => {
    return currentStepIndex.value > 0
  })

  async function loadStep(stepId: string) {
    isLoadingStep.value = true
    try {
      const safeId = normalizeStepId(stepId)
      if (safeId !== stepId) {
        console.warn(`알 수 없는 step id "${stepId}" — 첫 스텝으로 폴백합니다.`)
      }
      await new Promise((resolve) => setTimeout(resolve, 300))
      currentStepId.value = safeId
      userProgress.value.currentStep = safeId
      saveProgress()
    } finally {
      isLoadingStep.value = false
    }
  }

  function goToNextStep() {
    const nextIndex = currentStepIndex.value + 1
    if (nextIndex < CURRICULUM_STEPS.length) {
      loadStep(CURRICULUM_STEPS[nextIndex].id)
    }
  }

  function goToPreviousStep() {
    const prevIndex = currentStepIndex.value - 1
    if (prevIndex >= 0) {
      loadStep(CURRICULUM_STEPS[prevIndex].id)
    }
  }

  function markStepCompleted(stepId: string) {
    if (!userProgress.value.completedSteps.includes(stepId)) {
      userProgress.value.completedSteps.push(stepId)
      saveProgress()
    }
  }

  const isAllStepsCompleted = computed(() => {
    return userProgress.value.completedSteps.length === CURRICULUM_STEPS.length
  })

  /** 완료한 스텝 수 기준 현재 레벨 (1~4). 반응형이므로 computed 유지 */
  const currentLevel = computed(() => {
    const completedCount = userProgress.value.completedSteps.length
    for (let level = 1; level <= MAX_LEVEL; level++) {
      if (completedCount < getCumulativeStepsThroughLevel(level)) return level
    }
    return MAX_LEVEL
  })

  function restartCurriculum() {
    loadStep(FIRST_STEP_ID)
  }

  function incrementAttempt(stepId: string) {
    if (!userProgress.value.attempts[stepId]) {
      userProgress.value.attempts[stepId] = 0
    }
    userProgress.value.attempts[stepId]++
    saveProgress()
  }

  function saveProgress() {
    // localStorage 는 항상 백업으로 동기 저장한다 (Supabase 실패 / 로그아웃 시에도 데이터 보존)
    try {
      localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
    } catch {
      // 시크릿 모드 등 localStorage 접근 실패는 무시
    }

    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      progressService.saveProgress(userProgress.value).catch((e) => {
        console.warn('Supabase 진행상황 저장 실패 (localStorage 에 보관됨):', e?.message ?? e)
      })
    }
  }

  async function loadProgress() {
    const authStore = useAuthStore()
    let loaded: UserProgress | null = null

    if (authStore.isAuthenticated) {
      try {
        loaded = await progressService.getProgress()
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e)
        console.warn('Supabase 진행상황 로드 실패 — localStorage 로 폴백합니다:', message)
      }
    }

    if (!loaded) {
      const saved = localStorage.getItem('userProgress')
      if (saved) {
        try {
          loaded = JSON.parse(saved) as UserProgress
        } catch (e) {
          console.error('localStorage 진행상황 파싱 실패:', e)
        }
      }
    }

    userProgress.value = loaded ? sanitizeProgress(loaded) : sanitizeProgress(userProgress.value)
  }

  function resetProgress() {
    userProgress.value = {
      completedSteps: [],
      currentStep: FIRST_STEP_ID,
      attempts: {}
    }
    saveProgress()
    loadStep(FIRST_STEP_ID)
  }

  return {
    currentStep,
    allSteps,
    isLoadingStep,
    userProgress,
    canGoNext,
    canGoPrevious,
    loadStep,
    goToNextStep,
    goToPreviousStep,
    markStepCompleted,
    incrementAttempt,
    loadProgress,
    resetProgress,
    isAllStepsCompleted,
    currentLevel,
    restartCurriculum
  }
}
