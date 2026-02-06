import { ref, computed } from 'vue'
import type { CurriculumStep, UserProgress } from '@/types/curriculum'
import { CURRICULUM_STEPS, LEVEL_STEP_COUNTS } from '@/data/curriculum-steps'

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
    const completedCount = userProgress.value.completedSteps.length
    const level1StepCount = LEVEL_STEP_COUNTS[1] // 9개
    const level2StepCount = LEVEL_STEP_COUNTS[2] // 6개
    const level3StepCount = LEVEL_STEP_COUNTS[3] // 7개
    const level4StepCount = LEVEL_STEP_COUNTS[4] // 6개
    
    // 레벨별 완료 스텝 수 계산
    if (completedCount >= level1StepCount + level2StepCount + level3StepCount + level4StepCount) {
      return 4
    }
    if (completedCount >= level1StepCount + level2StepCount + level3StepCount) {
      return 4
    }
    if (completedCount >= level1StepCount + level2StepCount) {
      return 3
    }
    if (completedCount >= level1StepCount) {
      return 2
    }
    return 1
  })

  // 레벨별 완료 여부 체크
  const isLevelCompleted = computed(() => {
    const completedCount = userProgress.value.completedSteps.length
    const currentLevelValue = currentLevel.value
    
    // 현재 레벨까지의 누적 스텝 수 계산
    let requiredSteps = 0
    for (let level = 1; level <= currentLevelValue; level++) {
      requiredSteps += LEVEL_STEP_COUNTS[level as keyof typeof LEVEL_STEP_COUNTS] || 0
    }
    
    return completedCount >= requiredSteps
  })

  // 레벨별 완료한 스텝 수
  const completedStepsInCurrentLevel = computed(() => {
    const currentLevelValue = currentLevel.value
    const completedCount = userProgress.value.completedSteps.length
    
    // 이전 레벨들의 누적 스텝 수 계산
    let previousLevelSteps = 0
    for (let level = 1; level < currentLevelValue; level++) {
      previousLevelSteps += LEVEL_STEP_COUNTS[level as keyof typeof LEVEL_STEP_COUNTS] || 0
    }
    
    // 현재 레벨에서 완료한 스텝 수
    const currentLevelSteps = completedCount - previousLevelSteps
    const maxCurrentLevelSteps = LEVEL_STEP_COUNTS[currentLevelValue as keyof typeof LEVEL_STEP_COUNTS] || 0
    
    return Math.max(0, Math.min(currentLevelSteps, maxCurrentLevelSteps))
  })

  // 레벨별 총 스텝 수
  const totalStepsInCurrentLevel = computed(() => {
    const currentLevelValue = currentLevel.value
    return LEVEL_STEP_COUNTS[currentLevelValue as keyof typeof LEVEL_STEP_COUNTS] || 0
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
    isLevelCompleted,
    completedStepsInCurrentLevel,
    totalStepsInCurrentLevel,
    restartCurriculum
  }
}
