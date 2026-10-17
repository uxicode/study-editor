import type { CurriculumStep } from '@/types/curriculum'

export const week_3_4_p2: CurriculumStep = {
  id: 'week-3-4-p2',
  title: '2주차 · 연습 ② 관계 (1:N) include / select — 자식에서 부모 조회',
  order: 43,
  category: 'relations',
  content: {
    mission:
      '이미 정의한 `Post.author` 관계를 반대 방향으로 활용하세요. `prisma.post.findMany({ include: { author: true } })` 로 글과 작성자를 함께 조회합니다.',
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
      'Post → User 방향 include',
      '직전 스텝(관계 (1:N) include / select)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '자식에서 부모 조회 — 모든 채점 항목 통과'
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
        pattern: /prisma\.post\.findMany\s*\(\s*\{\s*include\s*:\s*\{\s*author\s*:\s*true/,
        message: 'prisma.post.findMany({ include: { author: true } }) 가 필요합니다.'
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
      content: '`prisma.post.findMany({ include: { author: true } })` 입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma.post.findMany({ include: { author: true } }) 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `const posts = await prisma.post.findMany({
  include: { author: true }
})
`
    }
  ]
}
