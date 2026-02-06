import type { CurriculumStep } from '@/types/curriculum'

export const step_11_1: CurriculumStep = {
  id: 'step-11-1',
  title: '트랜잭션으로 원자성 보장',
  order: 22,
  category: 'advanced',
  content: {
    mission: '$transaction을 사용하여 여러 작업을 하나의 트랜잭션으로 묶어 원자성을 보장하세요.',
    theory: `
      **트랜잭션**은 여러 작업을 하나의 단위로 묶어 모두 성공하거나 모두 실패하도록 보장합니다.
      
      ## $transaction 기본 사용법
      
      \`\`\`javascript
      await prisma.$transaction(async (tx) => {
        // 모든 작업이 성공하거나 모두 롤백됨
        await tx.user.create({ data: { email: "user@example.com" } })
        await tx.document.create({ data: { title: "문서" } })
      })
      \`\`\`
      
      ## 실무 활용
      
      \`\`\`javascript
      // 계좌 이체 예시
      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: 1 },
          data: { balance: { decrement: 1000 } }
        })
        await tx.account.update({
          where: { id: 2 },
          data: { balance: { increment: 1000 } }
        })
      })
      \`\`\`
    `,
    objectives: [
      '트랜잭션 개념 이해',
      '$transaction 사용법',
      '원자성 보장',
      '실무 활용'
    ],
    expectedOutput: '트랜잭션이 정상적으로 동작해야 합니다.'
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

model Document {
  id      Int    @id @default(autoincrement())
  title   String
  userId  Int
  user    User   @relation(fields: [userId], references: [id])
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
  // $transaction으로 사용자와 문서를 함께 생성
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: "user@example.com", name: "User" }
    })
    await tx.document.create({
      data: { title: "문서", userId: user.id }
    })
  })
  
  console.log('\\n✓ 트랜잭션이 정상적으로 동작합니다!')
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
        message: '$transaction을 사용해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: any) => {
          return result.success
        },
        message: '트랜잭션이 올바르게 실행되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '$transaction(async (tx) => { ... }) 형식으로 사용하세요.'
    },
    {
      level: 2,
      content: '완전한 정답입니다.',
      codeSnippet: `await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "user@example.com", name: "User" }
  })
  await tx.document.create({
    data: { title: "문서", userId: user.id }
  })
})`
    }
  ]
}
