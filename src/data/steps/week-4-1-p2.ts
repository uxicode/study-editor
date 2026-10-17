import type { CurriculumStep } from '@/types/curriculum'

export const week_4_1_p2: CurriculumStep = {
  id: 'week-4-1-p2',
  title: '3주차 · 연습 ② 트랜잭션 ($transaction) — 삭제 순서와 외래키',
  order: 55,
  category: 'advanced',
  content: {
    mission:
      '`prisma.$transaction([prisma.post.deleteMany(...), prisma.user.delete(...)])` 로 "글 삭제 → 사용자 삭제" 를 한 번에 처리하세요. 배열 안 **순서** 가 중요한 이유(외래키)를 `순서` 라는 단어를 넣어 `//` 주석으로 적으세요.',
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
      '배열 트랜잭션에서 순서가 중요한 이유',
      '직전 스텝(트랜잭션 ($transaction))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '삭제 순서와 외래키 — 모든 채점 항목 통과'
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
        pattern: /prisma\.\$transaction\s*\(\s*\[\s*prisma\.post\.deleteMany\s*\([\s\S]*?prisma\.user\.delete\s*\(/,
        message: '$transaction([post.deleteMany, user.delete]) 순서로 작성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*순서/,
        message: '배열 순서가 중요한 이유를 // 주석으로 적어야 합니다.'
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
      content: '`$transaction([prisma.post.deleteMany(...), prisma.user.delete(...)])` 순서로 쓰고, 주석에 `순서` 라는 단어로 이유를 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- $transaction([post.deleteMany, user.delete]) 순서로 작성해야 합니다.
- 배열 순서가 중요한 이유를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 글을 먼저 지우고 사용자를 지워야 외래키 제약에 걸리지 않습니다. (배열 안 순서가 중요)
await prisma.$transaction([
  prisma.post.deleteMany({ where: { authorId: 1 } }),
  prisma.user.delete({ where: { id: 1 } })
])
`
    }
  ]
}
