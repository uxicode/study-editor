import type { CurriculumStep } from '@/types/curriculum'

export const week_4_4: CurriculumStep = {
  id: 'week-4-4',
  title: '4주차 · 페이징 (skip / take · cursor)',
  order: 22,
  category: 'read',
  content: {
    mission:
      '`Post` 목록을 페이지 크기 10 으로 잘라 조회하세요. `skip` / `take` 방식과 `cursor` 방식 중 하나를 선택해 구현합니다.',
    theory: `
      ## 페이지 단위 조회의 두 가지 방식

      ### 1) Offset 페이징 (skip / take)

      \`\`\`ts
      await prisma.post.findMany({
        skip: (page - 1) * size,
        take: size,
        orderBy: { id: 'desc' }
      })
      \`\`\`

      - 구현이 단순하고 페이지 번호 UI 와 어울림
      - 데이터가 많아지면 뒤쪽 페이지 \`skip\` 비용이 커짐

      ### 2) Cursor 페이징

      \`\`\`ts
      await prisma.post.findMany({
        take: size,
        cursor: { id: lastId },
        skip: 1,
        orderBy: { id: 'desc' }
      })
      \`\`\`

      - 마지막 본 row 의 ID 를 기준으로 그 다음을 가져옴
      - 매우 큰 테이블에서도 일정한 성능 (인덱스가 받쳐줄 때)
      - "무한 스크롤" 과 잘 맞음

      ## 선택 기준
      | 상황                     | 추천            |
      |--------------------------|-----------------|
      | 1만 행 이하 + 페이지 UI  | skip / take     |
      | 수십만~수백만 행         | cursor          |
      | 정확한 페이지 번호 필요  | skip / take     |
    `,
    objectives: [
      'offset 페이징의 구현 방법',
      'cursor 페이징의 동작 원리',
      '둘 사이의 트레이드오프 인지'
    ],
    exercise: `
1. \`prisma.post.findMany\` 에 \`take: 10\` 을 적용하세요.
2. \`skip\` 또는 \`cursor\` 옵션 중 하나를 함께 사용하세요.
    `.trim(),
    expectedOutput: 'take: 10 + skip 또는 cursor'
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
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: findMany 에 take: 10 과 skip(또는 cursor) 옵션을 함께 사용하세요.
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
        pattern: /prisma\.post\.findMany\s*\(/,
        message: 'prisma.post.findMany 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /take\s*:\s*10\b/,
        message: 'take: 10 옵션이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /(skip\s*:|cursor\s*:)/,
        message: 'skip 또는 cursor 옵션 중 하나가 필요합니다.'
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
      content: 'skip 방식은 `skip: (page - 1) * size, take: size` 로 시작하세요.'
    },
    {
      level: 2,
      content: 'cursor 방식에서는 `skip: 1` 로 기준 행을 건너뛰는 것이 일반적입니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다 (skip/take).',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listPosts(page: number) {
  const size = 10
  return prisma.post.findMany({
    skip: (page - 1) * size,
    take: size,
    orderBy: { id: 'desc' }
  })
}

listPosts(1).finally(() => prisma.$disconnect())
`
    }
  ]
}
