import type { CurriculumStep } from '@/types/curriculum'

export const week_4_3_p1: CurriculumStep = {
  id: 'week-4-3-p1',
  title: '3주차 · 연습 ① N+1 문제와 해결 — Post → author include',
  order: 62,
  category: 'advanced',
  content: {
    mission:
      '`prisma.post.findMany({ include: { author: true } })` 로 글 목록과 작성자를 한 번에 조회하세요. (Post → User 방향의 N+1 해결)',
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
      '반대 방향에서도 N+1 해결',
      '직전 스텝(N+1 문제와 해결)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'Post → author include — 모든 채점 항목 통과'
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
        pattern: /prisma\.post\.findMany\s*\(\s*\{[\s\S]*?include\s*:\s*\{\s*author\s*:\s*true/,
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
      codeSnippet: `const posts = await prisma.post.findMany({ include: { author: true } })
`
    }
  ]
}
