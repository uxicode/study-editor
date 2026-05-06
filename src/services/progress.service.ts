import { apiService } from '@/services/api-service'
import type { UserProgress } from '@/types/curriculum'

export interface ProgressResponse {
  success: boolean
  progress: UserProgress
}

export async function getProgress(): Promise<UserProgress> {
  const data = await apiService.get<ProgressResponse>('/api/progress')
  if (data.success && data.progress) {
    return data.progress
  }
  return {
    completedSteps: [],
    currentStep: 'step-1',
    attempts: {}
  }
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  await apiService.put<ProgressResponse>('/api/progress', progress)
}
