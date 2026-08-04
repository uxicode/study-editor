import { db, type UserProgressEntity } from '@/lib/db'
import * as authService from '@/services/auth.service'
import type { UserProgress } from '@/types/curriculum'

const FIRST_STEP_ID = 'week-1-1'

export interface ExtendedUserProgress extends UserProgress {
  currentSteps?: Record<string, string>
  activeCurriculum?: string
}

function emptyProgress(): ExtendedUserProgress {
  return {
    completedSteps: [],
    currentStep: FIRST_STEP_ID,
    currentSteps: {
      backend: 'week-1-1',
      regex: 'week-5-1',
      algorithm: 'week-6-1',
      nextjs: 'week-7-1'
    },
    activeCurriculum: 'backend',
    attempts: {}
  }
}

function toUserProgress(entity: UserProgressEntity | null | undefined): ExtendedUserProgress {
  if (!entity) return emptyProgress()
  return {
    completedSteps: entity.completedSteps ?? [],
    currentStep: entity.currentStep ?? FIRST_STEP_ID,
    currentSteps: entity.currentSteps ?? {
      backend: 'week-1-1',
      regex: 'week-5-1',
      algorithm: 'week-6-1',
      nextjs: 'week-7-1'
    },
    activeCurriculum: entity.activeCurriculum ?? 'backend',
    attempts: entity.attempts ?? {}
  }
}

async function getCurrentUserId(): Promise<string> {
  const user = await authService.fetchMe()
  if (!user) {
    throw new Error('로그인 상태가 아닙니다.')
  }
  return user.id
}

export async function getProgress(): Promise<ExtendedUserProgress> {
  const userId = await getCurrentUserId()
  const entity = await db.userProgress.get(userId)
  return toUserProgress(entity)
}

export async function saveProgress(progress: ExtendedUserProgress): Promise<void> {
  const userId = await getCurrentUserId()
  const entity: UserProgressEntity = {
    userId,
    completedSteps: progress.completedSteps ?? [],
    currentStep: progress.currentStep ?? FIRST_STEP_ID,
    currentSteps: progress.currentSteps ?? {},
    activeCurriculum: progress.activeCurriculum ?? 'backend',
    attempts: progress.attempts ?? {},
    updatedAt: new Date().toISOString()
  }
  await db.userProgress.put(entity)
}
