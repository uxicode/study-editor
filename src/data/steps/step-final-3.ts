import type { CurriculumStep } from '@/types/curriculum'

export const step_final_3: CurriculumStep = {
  id: 'step-final-3',
  title: '레벨 3 최종 연습문제',
  order: 23,
  category: 'advanced',
  content: {
    mission: '레벨 3에서 배운 모든 내용을 종합하여 복합 쿼리, N:M 관계, 트랜잭션을 활용한 완전한 협업 시스템을 구현하세요.',
    theory: `
      레벨 3 종합 연습문제입니다. 복합 where 조건, 텍스트 검색, N:M 관계, 트랜잭션을 모두 활용하세요.
    `,
    objectives: [
      '복합 where 조건 활용',
      '텍스트 검색 구현',
      'N:M 관계 설정 및 조회',
      '트랜잭션으로 안전한 데이터 처리'
    ],
    exercise: `
1. **스키마**: User, Document, DocumentShare(N:M)를 정의하세요.
2. **$transaction** 안에서 사용자·문서·공유 관계를 create로 한꺼번에 만드세요.
3. **복합 where**와 **contains/startsWith**로 문서를 검색하는 쿼리를 작성하세요.
4. N:M 관계로 공유자 목록을 include로 조회해 로그로 확인하고, 정답 확인으로 검증하세요.
    `.trim(),
    expectedOutput: '완전한 협업 시스템 구현 완료'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `// 레벨 3 최종 연습문제
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User, Document, DocumentShare 모델 정의
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
  // 복합 쿼리, 텍스트 검색, N:M 관계, 트랜잭션 활용
  console.log('✅ 레벨 3 최종 연습문제 완료!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app.js',
        pattern: '$transaction',
        message: '트랜잭션을 사용해야 합니다.'
      }
    ],
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
      content: '레벨 3의 모든 개념을 종합하여 구현하세요.'
    }
  ]
}
