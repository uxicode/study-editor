import type { CurriculumStep } from '@/types/curriculum'

export const week_4_final_p3: CurriculumStep = {
  id: 'week-4-final-p3',
  title: '3주차 · 연습 ③ 페이징·인덱스·트랜잭션 — 보조 정렬 키',
  order: 76,
  category: 'advanced',
  content: {
    mission:
      '`orderBy: [{ createdAt: \'desc\' }, { id: \'desc\' }]` 로 정렬 기준을 두 개 두세요. 생성 시각이 같은 글이 있을 때 페이지 간 `중복`/`누락` 을 막는 이유를 `//` 주석으로 적으세요.',
    theory: `
      ## 복습: 실무형 목록 API

      - 응답에 \`totalPages = Math.ceil(total / size)\` 를 포함하면 클라이언트가 페이지 수를 알 수 있습니다.
      - Fastify \`schema.querystring\` 으로 \`page\` / \`size\` 의 범위와 기본값을 선언할 수 있습니다.
      - 정렬 기준이 겹칠 수 있으면 \`id\` 같은 유일 키를 보조 정렬로 둡니다: \`orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]\`
    `,
    objectives: [
      '정렬 안정성을 위한 다중 orderBy',
      '직전 스텝(페이징·인덱스·트랜잭션)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '보조 정렬 키 — 모든 채점 항목 통과'
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
        pattern: /orderBy\s*:\s*\[\s*\{\s*createdAt\s*:\s*'desc'\s*\}\s*,\s*\{\s*id\s*:\s*'desc'\s*\}\s*\]/,
        message: 'orderBy: [{ createdAt: \'desc\' }, { id: \'desc\' }] 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\/\/[^\n]*(중복|누락)/,
        message: '보조 정렬 키가 필요한 이유를 // 주석으로 적어야 합니다.'
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
      content: '`orderBy: [{ createdAt: \'desc\' }, { id: \'desc\' }]` 로 바꾸고, 주석에 `중복`/`누락` 을 막는 이유를 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] 가 필요합니다.
- 보조 정렬 키가 필요한 이유를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// createdAt 이 같은 글이 있어도 id 를 보조 키로 써서 페이지 간 중복/누락을 막습니다.
orderBy: [{ createdAt: 'desc' }, { id: 'desc' }]
`
    }
  ]
}
