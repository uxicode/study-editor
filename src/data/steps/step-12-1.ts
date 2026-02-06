import type { CurriculumStep } from '@/types/curriculum'

export const step_12_1: CurriculumStep = {
  id: 'step-12-1',
  title: 'N+1 쿼리 문제 이해 및 해결',
  order: 24,
  category: 'advanced',
  content: {
    mission: 'N+1 쿼리 문제를 이해하고 include로 해결하세요.',
    theory: `
      **N+1 쿼리 문제**는 반복문 안에서 쿼리를 실행하여 성능 저하를 일으키는 문제입니다.
      
      ## 문제 예시
      
      \`\`\`javascript
      // 1번 쿼리: 사용자 목록 조회
      const users = await prisma.user.findMany()
      
      // N번 쿼리: 각 사용자의 문서 조회 (반복문)
      for (const user of users) {
        const documents = await prisma.document.findMany({
          where: { userId: user.id }
        })
      }
      // 총 1 + N번 쿼리 실행 (N+1 문제)
      \`\`\`
      
      ## 해결 방법: include
      
      \`\`\`javascript
      // 1번 쿼리로 모든 데이터 조회
      const users = await prisma.user.findMany({
        include: {
          documents: true
        }
      })
      // 총 1번 쿼리만 실행
      \`\`\`
    `,
    objectives: [
      'N+1 쿼리 문제 이해',
      'include로 해결',
      '성능 최적화'
    ],
    expectedOutput: 'N+1 쿼리 문제가 해결되어야 합니다.'
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
  id        Int        @id @default(autoincrement())
  email     String     @unique
  documents Document[]
}

model Document {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int
  user   User   @relation(fields: [userId], references: [id])
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
  // include로 N+1 문제 해결
  const users = await prisma.user.findMany({
    include: {
      documents: true
    }
  })
  
  console.log('\\n✓ N+1 쿼리 문제가 해결되었습니다!')
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
        pattern: 'include',
        message: 'include를 사용해야 합니다.'
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
      content: 'include를 사용하여 관계 데이터를 함께 조회하세요.'
    }
  ]
}
