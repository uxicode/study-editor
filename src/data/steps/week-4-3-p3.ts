import type { CurriculumStep } from '@/types/curriculum'

export const week_4_3_p3: CurriculumStep = {
  id: 'week-4-3-p3',
  title: '3주차 · 연습 ③ N+1 문제와 해결 — 쿼리 수 계산',
  order: 64,
  category: 'advanced',
  content: {
    mission:
      '사용자가 100명일 때 "루프 안에서 글 조회" 방식과 `include` 방식이 각각 몇 번의 쿼리를 실행하는지 `//` 주석으로 계산하세요. 주석에 `101` 과 `2 번` 이라는 표현을 포함합니다.',
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
      'N+1 과 include 의 쿼리 수 차이 계량',
      '직전 스텝(N+1 문제와 해결)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '쿼리 수 계산 — 모든 채점 항목 통과'
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
        pattern: /\/\/[^\n]*101/,
        message: '루프 방식의 쿼리 수(101)를 // 주석으로 적어야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*\b2\s*번/,
        message: 'include 방식의 쿼리 수(2 번)를 // 주석으로 적어야 합니다.'
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
      content: '사용자 100명일 때 루프 방식은 `1 + 100 = 101` 번, include 는 `2 번`. 두 값을 각각 `//` 주석에 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 루프 방식의 쿼리 수(101)를 // 주석으로 적어야 합니다.
- include 방식의 쿼리 수(2 번)를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 루프 방식: 사용자 목록 1번 + 사용자마다 글 조회 100번 = 101 번의 쿼리
// include 방식: users 1번 + posts IN 조회 1번 = 2 번의 쿼리
`
    }
  ]
}
