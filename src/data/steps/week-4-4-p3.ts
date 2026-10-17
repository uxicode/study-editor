import type { CurriculumStep } from '@/types/curriculum'

export const week_4_4_p3: CurriculumStep = {
  id: 'week-4-4-p3',
  title: '3주차 · 연습 ③ 페이징 (skip / take · cursor) — offset 이 느린 이유',
  order: 68,
  category: 'read',
  content: {
    mission:
      '큰 offset(예: `skip: 1000000`)이 느린 이유를 `건너뛰` 라는 표현을 넣어 `//` 주석으로 설명하고, `orderBy` 없이 페이징하면 왜 위험한지(`중복`/`누락`/`보장` 중 하나 포함)를 `orderBy` 를 언급한 `//` 주석 한 줄로 적으세요.',
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
      '페이징 방식의 성능과 안정성 이해',
      '직전 스텝(페이징 (skip / take · cursor))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'offset 이 느린 이유 — 모든 채점 항목 통과'
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
        pattern: /\/\/[^\n]*건너뛰/,
        message: '큰 offset 이 느린 이유를 // 주석으로 설명해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*orderBy[^\n]*(보장|중복|누락)/,
        message: 'orderBy 없는 페이징의 위험을 // 주석으로 설명해야 합니다.'
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
      content: '첫 줄 주석에 `건너뛰` 라는 표현으로 큰 offset 의 문제를, 둘째 줄에 `orderBy` 를 언급하며 중복/누락 위험을 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 큰 offset 이 느린 이유를 // 주석으로 설명해야 합니다.
- orderBy 없는 페이징의 위험을 // 주석으로 설명해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 큰 offset 은 앞의 행들을 모두 읽고 건너뛰어야 해서 느리지만, cursor 는 인덱스로 바로 위치를 찾습니다.
// orderBy 없이 페이징하면 정렬이 보장되지 않아 페이지 사이에 중복/누락이 생길 수 있습니다.
`
    }
  ]
}
