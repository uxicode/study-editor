import type { CurriculumStep } from '@/types/curriculum'

export const week_3_4_p1: CurriculumStep = {
  id: 'week-3-4-p1',
  title: '2주차 · 연습 ① 관계 (1:N) include / select — select 로 필요한 컬럼만',
  order: 42,
  category: 'relations',
  content: {
    mission:
      '`prisma.user.findMany` 에서 `include` 대신 `select: { id: true, email: true, posts: { select: { title: true } } }` 로 필요한 컬럼만 가져오세요. `include` 와 `select` 의 차이를 두 단어를 모두 넣은 `//` 주석 한 줄로 적으세요.',
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
      'include 와 select 의 차이 이해',
      '직전 스텝(관계 (1:N) include / select)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'select 로 필요한 컬럼만 — 모든 채점 항목 통과'
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
        pattern: /select\s*:\s*\{[^}]*posts\s*:\s*\{\s*select\s*:\s*\{\s*title\s*:\s*true/,
        message: 'select 안에 posts: { select: { title: true } } 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*select[^\n]*include|\/\/[^\n]*include[^\n]*select/,
        message: 'include 와 select 의 차이를 // 주석 한 줄로 적어야 합니다.'
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
      content: '`select: { id: true, email: true, posts: { select: { title: true } } }` 형태입니다. 주석 한 줄에 `include` 와 `select` 를 모두 언급하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- select 안에 posts: { select: { title: true } } 가 필요합니다.
- include 와 select 의 차이를 // 주석 한 줄로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// include 는 관계 전체를 가져오고, select 는 필요한 필드만 골라 가져옵니다.
const slim = await prisma.user.findMany({
  select: { id: true, email: true, posts: { select: { title: true } } }
})
`
    }
  ]
}
