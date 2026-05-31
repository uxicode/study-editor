import { supabase } from '@/lib/supabase'
import type { UserProgress } from '@/types/curriculum'

const TABLE = 'user_progress'

interface ProgressRow {
  user_id: string
  completed_steps: string[]
  current_step: string
  attempts: Record<string, number>
  updated_at?: string
}

const FIRST_STEP_ID = 'week-1-1'

function emptyProgress(): UserProgress {
  return {
    completedSteps: [],
    currentStep: FIRST_STEP_ID,
    attempts: {}
  }
}

function toUserProgress(row: ProgressRow | null): UserProgress {
  if (!row) return emptyProgress()
  return {
    completedSteps: row.completed_steps ?? [],
    currentStep: row.current_step ?? FIRST_STEP_ID,
    attempts: row.attempts ?? {}
  }
}

async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Error('로그인 상태가 아닙니다.')
  }
  return data.user.id
}

export async function getProgress(): Promise<UserProgress> {
  const userId = await getCurrentUserId()
  const { data, error } = await supabase
    .from(TABLE)
    .select('user_id, completed_steps, current_step, attempts')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return toUserProgress(data as ProgressRow | null)
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  const userId = await getCurrentUserId()
  const row: ProgressRow = {
    user_id: userId,
    completed_steps: progress.completedSteps,
    current_step: progress.currentStep,
    attempts: progress.attempts
  }
  const { error } = await supabase.from(TABLE).upsert(row, { onConflict: 'user_id' })
  if (error) throw new Error(error.message)
}
