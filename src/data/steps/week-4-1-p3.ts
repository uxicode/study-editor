import type { CurriculumStep } from '@/types/curriculum'

export const week_4_1_p3: CurriculumStep = {
  id: 'week-4-1-p3',
  title: '3주차 · 연습 ③ 트랜잭션 ($transaction) — 배열 방식 vs 콜백 방식',
  order: 56,
  category: 'advanced',
  content: {
    mission:
      '배열 방식과 콜백 방식의 차이를 `//` 주석으로 비교하세요. `배열` 과 `콜백` 두 단어를 한 줄에 함께 넣고, 콜백 방식은 `중간 결과` 를 사용할 수 있다는 설명도 주석에 포함합니다.',
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
      '두 트랜잭션 방식의 차이를 설명',
      '직전 스텝(트랜잭션 ($transaction))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '배열 방식 vs 콜백 방식 — 모든 채점 항목 통과'
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
        pattern: /\/\/[^\n]*배열[^\n]*콜백|\/\/[^\n]*콜백[^\n]*배열/,
        message: '배열 방식과 콜백 방식을 비교하는 // 주석 한 줄이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*중간\s*결과/,
        message: '콜백 방식의 중간 결과 사용 가능성을 // 주석으로 적어야 합니다.'
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
      content: '주석 한 줄에 `배열` 과 `콜백` 을 함께 쓰고, 다른 줄에 콜백 방식은 `중간 결과` 를 쓸 수 있다고 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 배열 방식과 콜백 방식을 비교하는 // 주석 한 줄이 필요합니다.
- 콜백 방식의 중간 결과 사용 가능성을 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 배열 방식은 독립적인 쿼리를 묶을 때 간단하고, 콜백 방식은 유연합니다.
// 콜백 방식은 중간 결과를 보고 분기하거나 throw 로 롤백할 수 있습니다.
`
    }
  ]
}
