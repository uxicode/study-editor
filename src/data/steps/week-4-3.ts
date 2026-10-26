import type { CurriculumStep } from '@/types/curriculum'

export const week_4_3: CurriculumStep = {
  id: 'week-4-3',
  title: '3주차 · N+1 문제와 해결',
  order: 61,
  category: 'advanced',
  content: {
    mission:
      '사용자 목록을 가져온 뒤 각자의 글까지 조회하는 코드를, 반복문 안에서 글을 개별 조회(`findMany` / `findUnique`)하는 대신 `findMany({ include: { posts: true } })` 한 번으로 작성하여 N+1 쿼리를 제거하세요.',
    theory: `
      ## N+1 쿼리 문제

      가장 흔한 ORM 성능 함정입니다.

      \`\`\`ts
      // ❌ Bad: 1 + N 번 쿼리
      const users = await prisma.user.findMany()         // 1
      for (const u of users) {
        const posts = await prisma.post.findMany({       // N
          where: { userId: u.id }
        })
      }
      \`\`\`

      사용자가 100명이면 쿼리가 **101번** 날아갑니다.

      ## 해결: include 한 번으로

      \`\`\`ts
      // ✅ Good: 사용자 수와 무관하게 쿼리 수가 고정 (Prisma 는 기본적으로 2번의 쿼리로 처리)
      const users = await prisma.user.findMany({
        include: { posts: true }
      })
      \`\`\`

      ## 일반화된 처방

      - 반복문 안에서 \`findUnique\` / \`findMany\` 가 호출되면 의심하세요.
      - 한 번에 가져온 뒤 메모리에서 그룹핑하거나, \`include\` / \`select\` 로 처리하세요.
      - 어떻게 알지? — Prisma 의 query log 또는 DB 의 slow query log 로 확인합니다.
    `,
    objectives: [
      'N+1 쿼리의 정의와 발견 방법',
      'include 를 통한 해결',
      'Prisma 쿼리 패턴의 성능 영향 인지'
    ],
    exercise: `
1. \`server.ts\` 에서 \`prisma.user.findMany({ include: { posts: true } })\` 만 사용해 사용자와 글을 한 번에 가져오세요.
2. 반복문 안에 \`findUnique\` / \`findMany\` 호출이 없어야 합니다.
    `.trim(),
    expectedOutput: 'include: { posts: true } 사용',
    localPractice: `N+1 은 **쿼리가 몇 번 나가는지 세어 봐야** 체감됩니다. \`prisma-lab\` 에서 쿼리 로그를 켜세요.

\`\`\`ts
const prisma = new PrismaClient({ log: ['query'] })
\`\`\`

1. 사용자를 \`findMany\` 한 뒤 반복문에서 사용자별로 \`post.findMany\` 를 호출하는 **나쁜 코드** 를 실행하고, 콘솔에 찍힌 \`SELECT\` 줄 수를 세어 보세요. (사용자 수 + 1)
2. \`findMany({ include: { posts: true } })\` 로 바꾸고 다시 세어 보세요. (사용자 수와 무관하게 2회)
3. 사용자를 100명으로 늘려 두 방식의 전체 실행 시간을 \`console.time\` 으로 비교해 보세요.
    `.trim()
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
  email String
  posts Post[]
}

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int
  author User   @relation(fields: [userId], references: [id])
}
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: user 모델의 findMany 한 번에 include 옵션으로 posts 까지 가져오세요.
}

main().finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.findMany\s*\(/,
        message: 'prisma.user.findMany 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /include\s*:\s*\{[\s\S]*posts\s*:\s*true/,
        message: 'include: { posts: true } 를 사용해야 합니다.'
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
      content: '핵심은 "반복문 안에서 다른 쿼리를 호출하지 않는다" 는 점입니다.'
    },
    {
      level: 2,
      content: 'include 대신 select 도 가능합니다. 필요한 필드만 가져올 때 더 효율적입니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    include: { posts: true }
  })
  for (const u of users) {
    console.log(u.email, u.posts.length)
  }
}

main().finally(() => prisma.$disconnect())
`
    }
  ]
}
