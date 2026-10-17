import type { CurriculumStep } from '@/types/curriculum'

export const week_4_final_p2: CurriculumStep = {
  id: 'week-4-final-p2',
  title: '3주차 · 연습 ② 페이징·인덱스·트랜잭션 — querystring 검증',
  order: 75,
  category: 'advanced',
  content: {
    mission:
      '`schema.querystring` 으로 `page` (integer, `minimum: 1`, `default: 1`) 와 `size` (integer, `minimum: 1`, `maximum: 50`, `default: 10`) 를 검증하세요.',
    theory: `
      ## 복습: 실무형 목록 API

      - 응답에 \`totalPages = Math.ceil(total / size)\` 를 포함하면 클라이언트가 페이지 수를 알 수 있습니다.
      - Fastify \`schema.querystring\` 으로 \`page\` / \`size\` 의 범위와 기본값을 선언할 수 있습니다.
      - 정렬 기준이 겹칠 수 있으면 \`id\` 같은 유일 키를 보조 정렬로 둡니다: \`orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]\`
    `,
    objectives: [
      'JSON Schema 로 page / size 범위 제한',
      '직전 스텝(페이징·인덱스·트랜잭션)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'querystring 검증 — 모든 채점 항목 통과'
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
  id        Int      @id @default(autoincrement())
  title     String
  userId    Int
  createdAt DateTime @default(now())
  author    User     @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
}

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const fastify = Fastify({ logger: true })
const prisma = new PrismaClient()

fastify.get('/posts', async (request) => {
  const q = request.query as { page?: string; size?: string }
  const page = Math.max(1, Number(q.page ?? 1))
  const size = Math.min(100, Math.max(1, Number(q.size ?? 10)))

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      skip: (page - 1) * size,
      take: size,
      include: { author: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ])

  return { items, total, page, size }
})

fastify.listen({ port: 3000, host: '0.0.0.0' })

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /querystring\s*:\s*\{/,
        message: 'schema.querystring 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /minimum\s*:\s*1\b/,
        message: 'minimum: 1 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /maximum\s*:\s*50\b/,
        message: 'size 에 maximum: 50 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /default\s*:\s*10\b/,
        message: 'size 에 default: 10 이 필요합니다.'
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
      content: '`schema: { querystring: { type: \'object\', properties: { page: {...}, size: {...} } } }` 에 `minimum`, `maximum`, `default` 를 지정합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- schema.querystring 이 필요합니다.
- minimum: 1 이 필요합니다.
- size 에 maximum: 50 이 필요합니다.
- size 에 default: 10 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `fastify.get('/posts', {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        page: { type: 'integer', minimum: 1, default: 1 },
        size: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
      }
    }
  }
}, async (request) => {
  // ...
})
`
    }
  ]
}
