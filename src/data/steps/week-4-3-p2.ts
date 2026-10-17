import type { CurriculumStep } from '@/types/curriculum'

export const week_4_3_p2: CurriculumStep = {
  id: 'week-4-3-p2',
  title: '3주차 · 연습 ② N+1 문제와 해결 — include 안의 select',
  order: 63,
  category: 'advanced',
  content: {
    mission:
      '`include: { posts: { select: { title: true } } }` 로 사용자의 글 중 제목만 가져와 전송 데이터를 줄이세요.',
    theory: `
      ## 복습: N+1 문제

      - 목록 1번 + 항목마다 추가 조회 N번 = **N+1** 번의 쿼리.
      - \`include\` 를 쓰면 Prisma 가 \`users\` 1번 + \`posts IN (...)\` 1번, 총 **2번**으로 처리합니다.
      - \`include\` 안에서 \`select\` 로 필요한 필드만 가져오면 전송량도 줄어듭니다.

      \`\`\`ts
      prisma.user.findMany({ include: { posts: { select: { title: true } } } })
      \`\`\`
    `,
    objectives: [
      '필요한 필드만 가져와 전송량 줄이기',
      '직전 스텝(N+1 문제와 해결)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'include 안의 select — 모든 채점 항목 통과'
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
        pattern: /posts\s*:\s*\{\s*select\s*:\s*\{\s*title\s*:\s*true/,
        message: 'include 안에 posts: { select: { title: true } } 가 필요합니다.'
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
      content: '`include: { posts: { select: { title: true } } }` 형태입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- include 안에 posts: { select: { title: true } } 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `const slim = await prisma.user.findMany({
  include: { posts: { select: { title: true } } }
})
`
    }
  ]
}
