import type { CurriculumStep } from '@/types/curriculum'

export const week_4_4_p2: CurriculumStep = {
  id: 'week-4-4-p2',
  title: '3주차 · 연습 ② 페이징 (skip / take · cursor) — cursor 페이징',
  order: 67,
  category: 'read',
  content: {
    mission:
      '`orderBy: { id: \'desc\' }`, `cursor: { id: lastId }`, `skip: 1`, `take: 10` 으로 cursor 페이징을 구현하세요.',
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
      'cursor + skip: 1 구성',
      '직전 스텝(페이징 (skip / take · cursor))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'cursor 페이징 — 모든 채점 항목 통과'
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
        pattern: /cursor\s*:\s*\{\s*id\s*:\s*\w+\s*\}/,
        message: 'cursor: { id: lastId } 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /skip\s*:\s*1\b/,
        message: '커서 행을 제외하는 skip: 1 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /orderBy\s*:\s*\{\s*id\s*:\s*'desc'\s*\}[\s\S]{0,60}cursor\s*:|cursor\s*:[\s\S]{0,80}orderBy\s*:\s*\{\s*id\s*:\s*'desc'\s*\}/,
        message: 'cursor 와 함께 orderBy: { id: \'desc\' } 가 필요합니다.'
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
      content: '`orderBy: { id: \'desc\' }`, `cursor: { id: lastId }`, `skip: 1`, `take: 10` 을 한 findMany 에 함께 씁니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- cursor: { id: lastId } 가 필요합니다.
- 커서 행을 제외하는 skip: 1 이 필요합니다.
- cursor 와 함께 orderBy: { id: 'desc' } 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 마지막으로 본 id(lastId) 다음부터 10개를 가져오는 cursor 방식
const next = await prisma.post.findMany({
  orderBy: { id: 'desc' },
  cursor: { id: lastId },
  skip: 1, // 커서 행 자체는 제외
  take: 10
})
`
    }
  ]
}
