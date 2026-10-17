import type { CurriculumStep } from '@/types/curriculum'

export const week_4_4_p1: CurriculumStep = {
  id: 'week-4-4-p1',
  title: '3주차 · 연습 ① 페이징 (skip / take · cursor) — getPosts(page, size)',
  order: 66,
  category: 'read',
  content: {
    mission:
      '`getPosts(page, size)` 함수를 만들고 `skip = (safePage - 1) * size`, `take = size` 로 offset 페이징을 구현하세요. `Math.max(1, page)` 로 `page` 가 1 미만이면 1 로 보정합니다.',
    theory: `
      ## 복습: 페이징

      \`\`\`ts
      // offset: 페이지 번호 기반
      skip: (page - 1) * size, take: size

      // cursor: 마지막 항목 기반
      cursor: { id: lastId }, skip: 1, take: 10, orderBy: { id: 'desc' }
      \`\`\`

      - cursor 방식의 \`skip: 1\` 은 커서가 가리키는 행 자체를 제외합니다.
      - 큰 offset 은 앞 행을 모두 읽고 건너뛰어야 해서 느립니다. cursor 는 인덱스로 바로 이동합니다.
      - \`orderBy\` 없이 페이징하면 정렬이 보장되지 않아 중복/누락이 생길 수 있습니다.
    `,
    objectives: [
      'offset 페이징 함수 만들기',
      '직전 스텝(페이징 (skip / take · cursor))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'getPosts(page, size) — 모든 채점 항목 통과'
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

model Post {
  id     Int    @id @default(autoincrement())
  title  String
  userId Int
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

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /function\s+getPosts\s*\(|const\s+getPosts\s*=/,
        message: 'getPosts(page, size) 함수가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /Math\.max\s*\(\s*1\s*,/,
        message: 'Math.max(1, page) 로 page 를 보정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\(\s*\w+\s*-\s*1\s*\)\s*\*\s*size/,
        message: 'skip 은 (page - 1) * size 로 계산해야 합니다.'
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
      content: '`Math.max(1, page)` 로 보정한 값으로 `skip: (safePage - 1) * size`, `take: size` 를 계산하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- getPosts(page, size) 함수가 필요합니다.
- Math.max(1, page) 로 page 를 보정해야 합니다.
- skip 은 (page - 1) * size 로 계산해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `async function getPosts(page: number, size: number) {
  const safePage = Math.max(1, page)
  return prisma.post.findMany({
    orderBy: { id: 'desc' },
    skip: (safePage - 1) * size,
    take: size
  })
}
`
    }
  ]
}
