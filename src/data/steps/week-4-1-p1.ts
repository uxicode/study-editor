import type { CurriculumStep } from '@/types/curriculum'

export const week_4_1_p1: CurriculumStep = {
  id: 'week-4-1-p1',
  title: '3주차 · 연습 ① 트랜잭션 ($transaction) — 콜백 트랜잭션으로 계좌 이체',
  order: 54,
  category: 'advanced',
  content: {
    mission:
      '콜백 형태 `prisma.$transaction(async (tx) => { ... })` 로 계좌 이체를 구현하세요. 스키마에 추가된 `Account { id, balance }` 로 `tx.account.update` 를 두 번 호출해 보내는 쪽은 `decrement`, 받는 쪽은 `increment` 하고, 잔액이 부족하면 `throw new Error(...)` 로 롤백되게 합니다.',
    theory: `
      ## 복습: 트랜잭션

      \`\`\`ts
      // 배열 방식: 독립적인 쿼리를 묶음
      await prisma.$transaction([ prisma.post.deleteMany(...), prisma.user.delete(...) ])

      // 콜백 방식: tx 로 쿼리, 중간 결과 사용 가능, throw 하면 롤백
      await prisma.$transaction(async (tx) => {
        const from = await tx.account.update({ where: { id: 1 }, data: { balance: { decrement: 100 } } })
        if (from.balance < 0) throw new Error('INSUFFICIENT_BALANCE')
      })
      \`\`\`

      - 외래키가 걸려 있으면 자식(글)을 먼저 지우고 부모(사용자)를 지워야 합니다.
    `,
    objectives: [
      '콜백 방식 트랜잭션과 throw 롤백',
      '직전 스텝(트랜잭션 ($transaction))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '콜백 트랜잭션으로 계좌 이체 — 모든 채점 항목 통과'
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
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}

model Account {
  id      Int @id @default(autoincrement())
  balance Int
}

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: 아래에 이 문제의 풀이를 작성하세요.
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
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$transaction\s*\(\s*async\s*\(\s*tx\s*\)\s*=>/,
        message: 'prisma.$transaction(async (tx) => { ... }) 콜백 형태가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /tx\.account\.update\s*\(/,
        message: 'tx.account.update 를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /decrement\s*:/,
        message: '보내는 계좌에 decrement 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /increment\s*:/,
        message: '받는 계좌에 increment 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /throw\s+new\s+Error/,
        message: '잔액 부족 시 throw new Error 로 롤백해야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: unknown) => Boolean((result as { success?: boolean }).success),
        message: '코드가 정상적으로 분석되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`prisma.$transaction(async (tx) => { ... })` 안에서 `tx.account.update` 를 두 번 호출합니다. 잔액이 부족하면 `throw new Error(...)`.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma.$transaction(async (tx) => { ... }) 콜백 형태가 필요합니다.
- tx.account.update 를 사용해야 합니다.
- 보내는 계좌에 decrement 가 필요합니다.
- 받는 계좌에 increment 가 필요합니다.
- 잔액 부족 시 throw new Error 로 롤백해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `await prisma.$transaction(async (tx) => {
  const from = await tx.account.update({
    where: { id: 1 },
    data: { balance: { decrement: 100 } }
  })
  if (from.balance < 0) throw new Error('INSUFFICIENT_BALANCE')

  await tx.account.update({
    where: { id: 2 },
    data: { balance: { increment: 100 } }
  })
})
`
    }
  ]
}
