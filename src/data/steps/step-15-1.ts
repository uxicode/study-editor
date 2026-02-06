import type { CurriculumStep } from '@/types/curriculum'

export const step_15_1: CurriculumStep = {
  id: 'step-15-1',
  title: 'Soft Delete 패턴 구현',
  order: 28,
  category: 'advanced',
  content: {
    mission: 'deletedAt 필드를 사용하여 Soft Delete 패턴을 구현하세요.',
    theory: `
      **Soft Delete**는 데이터를 실제로 삭제하지 않고 삭제 표시만 하는 패턴입니다.
      
      ## Soft Delete 구현
      
      \`\`\`prisma
      model User {
        id        Int       @id @default(autoincrement())
        email     String    @unique
        deletedAt DateTime?
      }
      \`\`\`
      
      ## 삭제 쿼리
      
      \`\`\`javascript
      // Soft Delete
      await prisma.user.update({
        where: { id: 1 },
        data: { deletedAt: new Date() }
      })
      
      // 조회 시 제외
      const users = await prisma.user.findMany({
        where: {
          deletedAt: null
        }
      })
      \`\`\`
    `,
    objectives: [
      'Soft Delete 개념 이해',
      'deletedAt 필드 활용',
      '데이터 복구 기능'
    ],
    expectedOutput: 'Soft Delete 패턴이 구현되어야 합니다.'
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
  id        Int       @id @default(autoincrement())
  email     String    @unique
  name      String?
  deletedAt DateTime?
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
  const user = await prisma.user.create({
    data: { email: "user@example.com", name: "User" }
  })
  
  // Soft Delete
  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: new Date() }
  })
  
  // 삭제된 사용자 제외하고 조회
  const activeUsers = await prisma.user.findMany({
    where: {
      deletedAt: null
    }
  })
  
  console.log('\\n✓ Soft Delete 패턴이 정상적으로 동작합니다!')
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
        target: 'prisma/schema.prisma',
        pattern: 'deletedAt',
        message: 'deletedAt 필드가 필요합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: 'Soft Delete가 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: 'deletedAt 필드를 추가하고, 삭제 시 현재 시간을 저장하세요.'
    }
  ]
}
