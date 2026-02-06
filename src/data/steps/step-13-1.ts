import type { CurriculumStep } from '@/types/curriculum'

export const step_13_1: CurriculumStep = {
  id: 'step-13-1',
  title: '마이그레이션 관리',
  order: 26,
  category: 'migration',
  content: {
    mission: '마이그레이션의 개념을 이해하고 실무 프로세스를 학습하세요.',
    theory: `
      **마이그레이션**은 데이터베이스 스키마 변경을 관리하는 방법입니다.
      
      ## 마이그레이션 명령어
      
      - \`prisma migrate dev\`: 개발 환경에서 마이그레이션 생성 및 적용
      - \`prisma migrate deploy\`: 프로덕션 환경에서 마이그레이션 적용
      
      ## 실무 프로세스
      
      1. 스키마 수정
      2. \`prisma migrate dev --name migration_name\` 실행
      3. 마이그레이션 파일 생성 및 적용
      4. 프로덕션 배포 시 \`prisma migrate deploy\` 실행
    `,
    objectives: [
      '마이그레이션 개념 이해',
      '마이그레이션 명령어 학습',
      '실무 프로세스 이해'
    ],
    expectedOutput: '마이그레이션 개념을 이해해야 합니다.'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
}
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
  console.log('마이그레이션 관리 학습')
  console.log('\\n✓ 마이그레이션 개념을 이해했습니다!')
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
      content: '마이그레이션은 스키마 변경을 관리하는 방법입니다.'
    }
  ]
}
