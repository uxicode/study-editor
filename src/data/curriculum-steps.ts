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
// 레벨 2
import { step_5_1 as step5_1 } from './steps/step-5-1'
import { step_5_2 as step5_2 } from './steps/step-5-2'
import { step_6_1 as step6_1 } from './steps/step-6-1'
import { step_6_2 as step6_2 } from './steps/step-6-2'
import { step_7_1 as step7_1 } from './steps/step-7-1'
import { step_7_2 as step7_2 } from './steps/step-7-2'
import { step_final_2 as stepFinal2 } from './steps/step-final-2'
// 레벨 3
import { step_8_1 as step8_1 } from './steps/step-8-1'
import { step_8_2 as step8_2 } from './steps/step-8-2'
import { step_9_1 as step9_1 } from './steps/step-9-1'
import { step_9_2 as step9_2 } from './steps/step-9-2'
import { step_10_1 as step10_1 } from './steps/step-10-1'
import { step_11_1 as step11_1 } from './steps/step-11-1'
import { step_final_3 as stepFinal3 } from './steps/step-final-3'
// 레벨 4
import { step_12_1 as step12_1 } from './steps/step-12-1'
import { step_12_2 as step12_2 } from './steps/step-12-2'
import { step_13_1 as step13_1 } from './steps/step-13-1'
import { step_14_1 as step14_1 } from './steps/step-14-1'
import { step_15_1 as step15_1 } from './steps/step-15-1'
import { step_final_4 as stepFinal4 } from './steps/step-final-4'

export const CURRICULUM_STEPS: CurriculumStep[] = [
  // 레벨 1
  step1,
  step2_1,
  step2_2,
  step2_3,
  step3,
  step4_1,
  step4_2,
  step4_3,
  stepFinal1,
  // 레벨 2
  step5_1,
  step5_2,
  step6_1,
  step6_2,
  step7_1,
  step7_2,
  stepFinal2,
  // 레벨 3
  step8_1,
  step8_2,
  step9_1,
  step9_2,
  step10_1,
  step11_1,
  stepFinal3,
  // 레벨 4
  step12_1,
  step12_2,
  step13_1,
  step14_1,
  step15_1,
  stepFinal4
]

// 레벨별 스텝 개수 정의
export const LEVEL_STEP_COUNTS = {
  1: 9,  // 레벨 1: 8개 기본 스텝 + 1개 최종 연습문제
  2: 6,  // 레벨 2: 5개 기본 스텝 + 1개 최종 연습문제
  3: 7,  // 레벨 3: 6개 기본 스텝 + 1개 최종 연습문제
  4: 6   // 레벨 4: 5개 기본 스텝 + 1개 최종 연습문제
} as const
