import type { CurriculumStep } from '@/types/curriculum'

export const week_3_4_p3: CurriculumStep = {
  id: 'week-3-4-p3',
  title: '2주차 · 연습 ③ 관계 (1:N) include / select — 중첩 쓰기로 한 번에 생성',
  order: 44,
  category: 'relations',
  content: {
    mission:
      '중첩 쓰기를 사용해 `prisma.user.create({ data: { email, posts: { create: [{ title: \'a\' }, { title: \'b\' }] } } })` 로 사용자와 글 2개를 한 번에 생성하세요.',
    theory: `
      ## 복습: 관계 조회와 쓰기

      \`\`\`ts
      // include: 관계 전체, select: 필요한 필드만
      prisma.user.findMany({ include: { posts: true } })
      prisma.user.findMany({ select: { id: true, posts: { select: { title: true } } } })

      // 반대 방향 (자식 → 부모)
      prisma.post.findMany({ include: { author: true } })

      // 중첩 쓰기
      prisma.user.create({ data: { email, posts: { create: [{ title: 'a' }] } } })
      \`\`\`
    `,
    objectives: [
      '부모와 자식을 한 번에 생성',
      '직전 스텝(관계 (1:N) include / select)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '중첩 쓰기로 한 번에 생성 — 모든 채점 항목 통과'
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
        pattern: /prisma\.user\.create\s*\(\s*\{[\s\S]*?posts\s*:\s*\{\s*create\s*:\s*\[/,
        message: 'user.create 안에 posts: { create: [...] } 중첩 쓰기가 필요합니다.'
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
      content: '`data: { email, posts: { create: [ { title: \'a\' }, { title: \'b\' } ] } }` 입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- user.create 안에 posts: { create: [...] } 중첩 쓰기가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `await prisma.user.create({
  data: {
    email: 'new@example.com',
    posts: { create: [{ title: 'a' }, { title: 'b' }] }
  }
})
`
    }
  ]
}
