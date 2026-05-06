import type { CurriculumStep } from '@/types/curriculum'

export const step_final_4: CurriculumStep = {
  id: 'step-final-4',
  title: '레벨 4 최종 연습문제',
  order: 29,
  category: 'advanced',
  content: {
    mission: '레벨 4에서 배운 모든 내용을 종합하여 성능 최적화와 고급 패턴을 구현하세요.',
    theory: `
      레벨 4 종합 연습문제입니다. N+1 쿼리 최적화, 배치 처리, Soft Delete를 모두 활용하세요.
    `,
    objectives: [
      'N+1 쿼리 최적화',
      '배치 처리 구현',
      'Soft Delete 패턴 구현'
    ],
    exercise: `
1. **스키마**: User, Document(1:N), 필요 시 DocumentShare(N:M)와 **deletedAt** 필드를 정의하세요.
2. **N+1 방지**: 사용자 목록 조회 시 \`include: { documents: true }\`로 문서를 함께 가져오세요.
3. **배치**: createMany 또는 Promise.all로 여러 레코드를 한 번에 생성하세요.
4. **Soft Delete**: deletedAt이 null인 것만 조회하고, "삭제" 시 update로 deletedAt을 설정하세요.
5. 위 패턴을 적용한 뒤 정답 확인으로 검증을 통과하세요.
    `.trim(),
    expectedOutput: '성능 최적화와 고급 패턴 구현 완료'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// 레벨 4 최종 연습문제
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User, Document 모델 정의 (Soft Delete 포함)
`
    },
    {
      name: 'app.js',
      path: 'app.js',
      language: 'javascript',
      content: `// CommonJS 호환 import
import pkg from '@prisma/client'
const { PrismaClient } = pkg

const prisma = new PrismaClient()

async function main() {
  // N+1 최적화, 배치 처리, Soft Delete 활용
  console.log('✅ 레벨 4 최종 연습문제 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: '코드가 성공적으로 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '레벨 4의 모든 개념을 종합하여 구현하세요.'
    }
  ]
}
