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

// Week 5 — Regex & JS Core
import { week_5_1 } from './steps/week-5-1'
import { week_5_2 } from './steps/week-5-2'
import { week_5_3 } from './steps/week-5-3'
import { week_5_4 } from './steps/week-5-4'
import { week_5_5 } from './steps/week-5-5'
import { week_5_final } from './steps/week-5-final'

// Week 6 — Algorithms
import { week_6_1 } from './steps/week-6-1'
import { week_6_2 } from './steps/week-6-2'
import { week_6_3 } from './steps/week-6-3'
import { week_6_4 } from './steps/week-6-4'
import { week_6_5 } from './steps/week-6-5'
import { week_6_6 } from './steps/week-6-6'
import { week_6_7 } from './steps/week-6-7'
import { week_6_8 } from './steps/week-6-8'
import { week_6_9 } from './steps/week-6-9'
import { week_6_10 } from './steps/week-6-10'
import { week_6_11 } from './steps/week-6-11'
import { week_6_12 } from './steps/week-6-12'
import { week_6_13 } from './steps/week-6-13'
import { week_6_14 } from './steps/week-6-14'
import { week_6_15 } from './steps/week-6-15'
import { week_6_final } from './steps/week-6-final'

// Week 7 — Next.js & React Hooks
import { week_7_1 } from './steps/week-7-1'
import { week_7_2 } from './steps/week-7-2'
import { week_7_3 } from './steps/week-7-3'
import { week_7_4 } from './steps/week-7-4'
import { week_7_5 } from './steps/week-7-5'
import { week_7_final } from './steps/week-7-final'

// Week 8 — Zustand & TanStack Query
import { week_8_1 } from './steps/week-8-1'
import { week_8_2 } from './steps/week-8-2'
import { week_8_3 } from './steps/week-8-3'
import { week_8_4 } from './steps/week-8-4'
import { week_8_5 } from './steps/week-8-5'
import { week_8_final } from './steps/week-8-final'

// Week 9 — Authentication & Security
import { week_9_1 } from './steps/week-9-1'
import { week_9_2 } from './steps/week-9-2'
import { week_9_3 } from './steps/week-9-3'
import { week_9_4 } from './steps/week-9-4'
import { week_9_5 } from './steps/week-9-5'
import { week_9_final } from './steps/week-9-final'

export type CurriculumType = 'backend' | 'regex' | 'algorithm' | 'nextjs'

export interface Curriculum {
  id: CurriculumType
  title: string
  icon: string
  description: string
  steps: CurriculumStep[]
  levelCounts: Record<number, number>
}

export const CURRICULUMS: Curriculum[] = [
  {
    id: 'backend',
    title: '백엔드 코어',
    icon: '💻',
    description: 'Fastify, MySQL DDL, Prisma ORM 및 레이어드 아키텍처',
    steps: [
      week_1_1, week_1_2, week_1_3, week_1_4, week_1_5, week_1_final,
      week_2_1, week_2_2, week_2_3, week_2_4, week_2_5, week_2_final,
      week_3_1, week_3_2, week_3_3, week_3_4, week_3_5, week_3_final,
      week_4_1, week_4_2, week_4_3, week_4_4, week_4_5, week_4_final
    ],
    levelCounts: { 1: 6, 2: 6, 3: 6, 4: 6 }
  },
  {
    id: 'regex',
    title: '정규식 & 데이터 처리',
    icon: '🔍',
    description: '텍스트 정규식 분석 및 자바스크립트 고차 함수 데이터 처리',
    steps: [
      week_5_1, week_5_2, week_5_3, week_5_4, week_5_5, week_5_final
    ],
    levelCounts: { 1: 6 }
  },
  {
    id: 'algorithm',
    title: '필수 알고리즘',
    icon: '🧮',
    description: '정렬, 스택/큐, 해시맵, 탐색(DFS/BFS), DP 기초',
    steps: [
      week_6_1, week_6_2, week_6_3, week_6_4,
      week_6_5, week_6_6, week_6_7, week_6_8,
      week_6_9, week_6_10, week_6_11, week_6_12,
      week_6_13, week_6_14, week_6_15, week_6_final
    ],
    levelCounts: { 1: 4, 2: 4, 3: 4, 4: 4 }
  },
  {
    id: 'nextjs',
    title: 'Next.js & 프론트엔드',
    icon: '⚛️',
    description: 'App Router, React Hooks, Zustand, TanStack Query 및 통합 인증',
    steps: [
      week_7_1, week_7_2, week_7_3, week_7_4, week_7_5, week_7_final,
      week_8_1, week_8_2, week_8_3, week_8_4, week_8_5, week_8_final,
      week_9_1, week_9_2, week_9_3, week_9_4, week_9_5, week_9_final
    ],
    levelCounts: { 1: 6, 2: 6, 3: 6 }
  }
]

export const CURRICULUM_STEPS: CurriculumStep[] = [
  ...CURRICULUMS[0].steps,
  ...CURRICULUMS[1].steps,
  ...CURRICULUMS[2].steps,
  ...CURRICULUMS[3].steps
]

/**
 * 주차별 스텝 개수 (하위 호환성용)
 */
export const LEVEL_STEP_COUNTS = {
  1: 6,
  2: 6,
  3: 6,
  4: 6,
  5: 6,
  6: 16,
  7: 6,
  8: 6,
  9: 6
} as const
