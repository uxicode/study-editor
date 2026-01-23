import { ref, computed } from 'vue'
import type { CurriculumStep, UserProgress } from '@/types/curriculum'
import { CURRICULUM_STEPS } from '@/data/curriculum-steps'

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

  const currentLevel = computed(() => {
    // 4개 스텝마다 레벨 1개
    return Math.floor(userProgress.value.completedSteps.length / 4) + 1
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
    localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
  }

  function loadProgress() {
    const saved = localStorage.getItem('userProgress')
    if (saved) {
      try {
        userProgress.value = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to load progress:', e)
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
