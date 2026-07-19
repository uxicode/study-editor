import { ref, computed } from 'vue'
import type { CurriculumStep } from '@/types/curriculum'
import { CURRICULUMS, type CurriculumType } from '@/data/curriculum-steps'
import { useAuthStore } from '@/stores/auth-store'
import * as progressService from '@/services/progress.service'

interface UserProgress {
  completedSteps: string[]
  currentStep: string // 하위 호환용 (마지막으로 열었던 스텝)
  currentSteps: Record<string, string> // 각 커리큘럼별 현재 스텝
  activeCurriculum: CurriculumType
  attempts: Record<string, number>
}

const activeCurriculumId = ref<CurriculumType>('backend')
const currentStepId = ref<string>('week-1-1')

const userProgress = ref<UserProgress>({
  completedSteps: [],
  currentStep: 'week-1-1',
  currentSteps: {
    backend: 'week-1-1',
    regex: 'week-5-1',
    algorithm: 'week-6-1',
    nextjs: 'week-7-1'
  },
  activeCurriculum: 'backend',
  attempts: {}
})

function sanitizeProgress(input: Partial<UserProgress>): UserProgress {
  const completed = input.completedSteps ?? []
  const activeCurr = (input.activeCurriculum as CurriculumType) ?? 'backend'
  
  // 기본 currentSteps 맵
  const defaultCurrentSteps: Record<string, string> = {
    backend: 'week-1-1',
    regex: 'week-5-1',
    algorithm: 'week-6-1',
    nextjs: 'week-7-1'
  }

  return {
    completedSteps: completed,
    currentStep: input.currentStep ?? 'week-1-1',
    currentSteps: {
      ...defaultCurrentSteps,
      ...(input.currentSteps ?? {})
    },
    activeCurriculum: activeCurr,
    attempts: input.attempts ?? {}
  }
}

export function useCurriculum() {
  const isLoadingStep = ref(false)

  const activeCurriculum = computed(() => {
    return CURRICULUMS.find(c => c.id === activeCurriculumId.value) || CURRICULUMS[0]
  })

  const allSteps = computed(() => {
    return activeCurriculum.value.steps
  })

  const currentStep = computed<CurriculumStep | null>(() => {
    return activeCurriculum.value.steps.find(step => step.id === currentStepId.value) || activeCurriculum.value.steps[0] || null
  })

  const currentStepIndex = computed(() => {
    return activeCurriculum.value.steps.findIndex(step => step.id === currentStepId.value)
  })

  const canGoNext = computed(() => {
    return userProgress.value.completedSteps.includes(currentStepId.value)
  })

  const canGoPrevious = computed(() => {
    return currentStepIndex.value > 0
  })

  const completedStepsInActiveCurriculum = computed(() => {
    return activeCurriculum.value.steps.filter(step => userProgress.value.completedSteps.includes(step.id))
  })

  const isAllStepsCompleted = computed(() => {
    return completedStepsInActiveCurriculum.value.length === activeCurriculum.value.steps.length
  })

  const currentLevel = computed(() => {
    const completedCount = completedStepsInActiveCurriculum.value.length
    let sum = 0
    const keys = Object.keys(activeCurriculum.value.levelCounts).map(Number).sort((a, b) => a - b)
    for (const level of keys) {
      sum += activeCurriculum.value.levelCounts[level]
      if (completedCount < sum) return level
    }
    return keys[keys.length - 1] || 1
  })

  async function loadStep(stepId: string) {
    isLoadingStep.value = true
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      currentStepId.value = stepId
      
      // 현재 커리큘럼의 저장된 스텝 업데이트
      if (!userProgress.value.currentSteps) {
        userProgress.value.currentSteps = {}
      }
      userProgress.value.currentSteps[activeCurriculumId.value] = stepId
      userProgress.value.currentStep = stepId
      saveProgress()
    } finally {
      isLoadingStep.value = false
    }
  }

  function goToNextStep() {
    const nextIndex = currentStepIndex.value + 1
    if (nextIndex < activeCurriculum.value.steps.length) {
      loadStep(activeCurriculum.value.steps[nextIndex].id)
    }
  }

  function goToPreviousStep() {
    const prevIndex = currentStepIndex.value - 1
    if (prevIndex >= 0) {
      loadStep(activeCurriculum.value.steps[prevIndex].id)
    }
  }

  function markStepCompleted(stepId: string) {
    if (!userProgress.value.completedSteps.includes(stepId)) {
      userProgress.value.completedSteps.push(stepId)
      saveProgress()
    }
  }

  function restartCurriculum() {
    const firstStepId = activeCurriculum.value.steps[0]?.id || 'week-1-1'
    loadStep(firstStepId)
  }

  function incrementAttempt(stepId: string) {
    if (!userProgress.value.attempts[stepId]) {
      userProgress.value.attempts[stepId] = 0
    }
    userProgress.value.attempts[stepId]++
    saveProgress()
  }

  async function changeCurriculum(curriculumId: CurriculumType) {
    activeCurriculumId.value = curriculumId
    userProgress.value.activeCurriculum = curriculumId
    
    // 이전에 이 커리큘럼에서 저장된 스텝 불러오기, 없으면 첫 스텝 로드
    if (!userProgress.value.currentSteps) {
      userProgress.value.currentSteps = {}
    }
    const savedStep = userProgress.value.currentSteps[curriculumId]
    const targetCurriculum = CURRICULUMS.find(c => c.id === curriculumId) || CURRICULUMS[0]
    const defaultStep = targetCurriculum.steps[0]?.id || 'week-1-1'
    
    const targetStep = savedStep || defaultStep
    await loadStep(targetStep)
  }

  function saveProgress() {
    try {
      localStorage.setItem('userProgress', JSON.stringify(userProgress.value))
    } catch {
      // ignore
    }

    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      // Supabase 테이블 저장을 위해 하위 호환 가능한 필드 변환
      const dbPayload = {
        completed_steps: userProgress.value.completedSteps,
        current_step: userProgress.value.currentStep,
        attempts: userProgress.value.attempts
      }
      progressService.saveProgress(dbPayload as any).catch((e) => {
        console.warn('Supabase 진행상황 저장 실패 (localStorage 에 보관됨):', e?.message ?? e)
      })
    }
  }

  async function loadProgress() {
    const authStore = useAuthStore()
    let loaded: any = null

    if (authStore.isAuthenticated) {
      try {
        loaded = await progressService.getProgress()
      } catch (e) {
        console.warn('Supabase 진행상황 로드 실패 — localStorage 로 폴백합니다:', e)
      }
    }

    if (!loaded) {
      const saved = localStorage.getItem('userProgress')
      if (saved) {
        try {
          loaded = JSON.parse(saved)
        } catch (e) {
          console.error('localStorage 진행상황 파싱 실패:', e)
        }
      }
    }

    if (loaded) {
      // Supabase 에서 로드된 경우 db 필드에서 변환 필요
      const completed = loaded.completed_steps ?? loaded.completedSteps ?? []
      const current = loaded.current_step ?? loaded.currentStep ?? 'week-1-1'
      const attempts = loaded.attempts ?? {}
      
      const parsed: Partial<UserProgress> = {
        completedSteps: completed,
        currentStep: current,
        currentSteps: loaded.currentSteps ?? {
          backend: current.startsWith('week-1') || current.startsWith('week-2') || current.startsWith('week-3') || current.startsWith('week-4') ? current : 'week-1-1',
          regex: current.startsWith('week-5') ? current : 'week-5-1',
          algorithm: current.startsWith('week-6') ? current : 'week-6-1',
          nextjs: current.startsWith('week-7') || current.startsWith('week-8') || current.startsWith('week-9') ? current : 'week-7-1'
        },
        activeCurriculum: loaded.activeCurriculum ?? (
          current.startsWith('week-5') ? 'regex' :
          current.startsWith('week-6') ? 'algorithm' :
          current.startsWith('week-7') || current.startsWith('week-8') || current.startsWith('week-9') ? 'nextjs' : 'backend'
        ),
        attempts
      }
      userProgress.value = sanitizeProgress(parsed)
    } else {
      userProgress.value = sanitizeProgress(userProgress.value)
    }

    // 로드된 activeCurriculumId 및 currentStepId 반영
    activeCurriculumId.value = userProgress.value.activeCurriculum
    const targetCurriculum = CURRICULUMS.find(c => c.id === activeCurriculumId.value) || CURRICULUMS[0]
    currentStepId.value = userProgress.value.currentSteps[activeCurriculumId.value] || targetCurriculum.steps[0]?.id || 'week-1-1'
  }

  function resetProgress() {
    userProgress.value = sanitizeProgress({
      completedSteps: [],
      currentStep: 'week-1-1',
      attempts: {}
    })
    activeCurriculumId.value = 'backend'
    currentStepId.value = 'week-1-1'
    saveProgress()
  }

  return {
    activeCurriculumId,
    activeCurriculum,
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
    restartCurriculum,
    changeCurriculum
  }
}
