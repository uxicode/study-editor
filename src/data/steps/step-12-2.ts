import type { CurriculumStep } from '@/types/curriculum'

export const step_12_2: CurriculumStep = {
  id: 'step-12-2',
  title: '배치 처리와 효율적 쿼리',
  order: 25,
  category: 'advanced',
  content: {
    mission: 'createMany, updateMany, Promise.all을 사용하여 배치 처리를 구현하세요.',
    theory: `
      **배치 처리**는 여러 작업을 한 번에 처리하여 성능을 향상시킵니다.
      
      ## createMany
      
      \`\`\`javascript
      await prisma.user.createMany({
        data: [
          { email: "user1@example.com" },
          { email: "user2@example.com" },
          { email: "user3@example.com" }
        ]
      })
      \`\`\`
      
      ## Promise.all
      
      \`\`\`javascript
      await Promise.all([
        prisma.user.create({ data: { email: "user1@example.com" } }),
        prisma.user.create({ data: { email: "user2@example.com" } })
      ])
      \`\`\`
    `,
    objectives: [
      'createMany로 대량 데이터 생성',
      'Promise.all로 병렬 처리',
      '성능 최적화'
    ],
    expectedOutput: '배치 처리가 정상적으로 동작해야 합니다.'
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
  name  String?
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
  // createMany로 배치 생성
  await prisma.user.createMany({
    data: [
      { email: "user1@example.com", name: "User 1" },
      { email: "user2@example.com", name: "User 2" },
      { email: "user3@example.com", name: "User 3" }
    ]
  })
  
  console.log('\\n✓ 배치 처리가 정상적으로 동작합니다!')
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
        pattern: 'createMany',
        message: 'createMany를 사용해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: '배치 처리가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'createMany로 여러 레코드를 한 번에 생성하세요.'
    }
  ]
}
