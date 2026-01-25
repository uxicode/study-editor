import type { CurriculumStep } from '@/types/curriculum'
import { step_1 as step1 } from './steps/step-1'
import { step_2_1 as step2_1 } from './steps/step-2-1'
import { step_2_2 as step2_2 } from './steps/step-2-2'
import { step_2_3 as step2_3 } from './steps/step-2-3'
import { step_3 as step3 } from './steps/step-3'
import { step_4_1 as step4_1 } from './steps/step-4-1'
import { step_4_2 as step4_2 } from './steps/step-4-2'
import { step_4_3 as step4_3 } from './steps/step-4-3'
import { step_final_1 as stepFinal1 } from './steps/step-final-1'

export const CURRICULUM_STEPS: CurriculumStep[] = [
  step1,
  step2_1,
  step2_2,
  step2_3,
  step3,
  step4_1,
  step4_2,
  step4_3,
  stepFinal1
]

// 레벨별 스텝 개수 정의
export const LEVEL_STEP_COUNTS = {
  1: 9, // 레벨 1: 8개 기본 스텝 + 1개 최종 연습문제
  2: 0  // 레벨 2: 추후 추가 예정
} as const
