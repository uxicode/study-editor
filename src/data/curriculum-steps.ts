import type { CurriculumStep } from '@/types/curriculum'

// Week 1 — Fastify + TS
import { week_1_1 } from './steps/week-1-1'
import { week_1_2 } from './steps/week-1-2'
import { week_1_3 } from './steps/week-1-3'
import { week_1_4 } from './steps/week-1-4'
import { week_1_5 } from './steps/week-1-5'
import { week_1_final } from './steps/week-1-final'

// Week 2 — MySQL DDL
import { week_2_1 } from './steps/week-2-1'
import { week_2_2 } from './steps/week-2-2'
import { week_2_3 } from './steps/week-2-3'
import { week_2_4 } from './steps/week-2-4'
import { week_2_5 } from './steps/week-2-5'
import { week_2_final } from './steps/week-2-final'

// Week 3 — Prisma ORM · Layered architecture
import { week_3_1 } from './steps/week-3-1'
import { week_3_2 } from './steps/week-3-2'
import { week_3_3 } from './steps/week-3-3'
import { week_3_4 } from './steps/week-3-4'
import { week_3_5 } from './steps/week-3-5'
import { week_3_final } from './steps/week-3-final'

// Week 4 — Transactions · indexes · performance
import { week_4_1 } from './steps/week-4-1'
import { week_4_2 } from './steps/week-4-2'
import { week_4_3 } from './steps/week-4-3'
import { week_4_4 } from './steps/week-4-4'
import { week_4_5 } from './steps/week-4-5'
import { week_4_final } from './steps/week-4-final'

export const CURRICULUM_STEPS: CurriculumStep[] = [
  // Week 1
  week_1_1,
  week_1_2,
  week_1_3,
  week_1_4,
  week_1_5,
  week_1_final,
  // Week 2
  week_2_1,
  week_2_2,
  week_2_3,
  week_2_4,
  week_2_5,
  week_2_final,
  // Week 3
  week_3_1,
  week_3_2,
  week_3_3,
  week_3_4,
  week_3_5,
  week_3_final,
  // Week 4
  week_4_1,
  week_4_2,
  week_4_3,
  week_4_4,
  week_4_5,
  week_4_final
]

/**
 * 주차별 스텝 개수 (각 주 5개 기본 + 1개 종합 = 6개).
 * 키 이름은 기존 `LEVEL_STEP_COUNTS` 를 유지하여 `useCurriculum` 의 currentLevel 계산 로직과 호환된다.
 */
export const LEVEL_STEP_COUNTS = {
  1: 6,
  2: 6,
  3: 6,
  4: 6
} as const
