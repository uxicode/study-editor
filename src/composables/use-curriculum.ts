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

const currentStepId = ref<string>('')
const userProgress = ref<UserProgress>({
  completedSteps: [],
  currentStep: 'step-1',
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
      // 실제로는 API 호출이나 파일 로딩이 필요할 수 있음
      await new Promise(resolve => setTimeout(resolve, 300))
      currentStepId.value = stepId
      userProgress.value.currentStep = stepId
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
    loadStep('step-1')
  }

  function incrementAttempt(stepId: string) {
    if (!userProgress.value.attempts[stepId]) {
      userProgress.value.attempts[stepId] = 0
    }
    userProgress.value.attempts[stepId]++
    saveProgress()
  }

  function saveProgress() {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      progressService.saveProgress(userProgress.value).catch((e) => {
        console.error('진행상황 저장 실패:', e)
      })
    } else {
      localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
    }
  }

  async function loadProgress() {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      try {
        const progress = await progressService.getProgress()
        userProgress.value = progress
      } catch (e) {
        console.error('진행상황 로드 실패:', e)
      }
    } else {
      const saved = localStorage.getItem('userProgress')
      if (saved) {
        try {
          userProgress.value = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to load progress:', e)
        }
      }
    }
  }

  function resetProgress() {
    userProgress.value = {
      completedSteps: [],
      currentStep: 'step-1',
      attempts: {}
    }
    saveProgress()
    loadStep('step-1')
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
