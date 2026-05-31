import type { CurriculumStep } from '@/types/curriculum'

export const week_4_final: CurriculumStep = {
  id: 'week-4-final',
  title: '4주차 종합 · 페이징·인덱스·트랜잭션',
  order: 24,
  category: 'advanced',
  content: {
    mission:
      'Fastify 의 `GET /posts?page=&size=` 핸들러에서 `prisma.$transaction` 으로 "글 목록 + 총 개수" 를 한 번에 가져오고, `include` 로 작성자 정보까지 함께 로드하며, Prisma 스키마에는 적절한 `@@index` 를 정의하세요.',
    theory: `
      4주차의 모든 도구를 한 핸들러에 통합합니다.

      ## 요구사항

      - URL: \`GET /posts?page=1&size=10\`
      - 응답: \`{ items: Post[], total: number, page: number, size: number }\`
      - 한 번의 트랜잭션 안에서 목록 + 총 개수 조회 (\`$transaction\`)
      - 작성자 정보를 같이 로드 (\`include\`)
      - \`@@index([userId, createdAt])\` 와 \`@@index([createdAt])\` 등을 적절히 추가

      ## 한 줄 정리

      \`\`\`ts
      const [items, total] = await prisma.$transaction([
        prisma.post.findMany({
          skip: (page - 1) * size,
          take: size,
          include: { author: true },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.post.count()
      ])
      \`\`\`

      이 패턴은 실무에서 매우 자주 등장합니다.
    `,
    objectives: [
      '$transaction · include · @@index · 페이징을 결합',
      '실무에서 자주 보는 페이징 응답 형태 익히기',
      '성능 최적화의 일반 원칙을 실코드로 적용'
    ],
    exercise: `
1. \`schema.prisma\` 에 \`@@index([userId, createdAt])\` 을 포함시키세요.
2. \`server.ts\` 의 \`GET /posts\` 핸들러에서 다음 4가지 키워드가 모두 등장해야 합니다.
   - \`$transaction\`
   - \`include\`
   - \`take\`
   - \`@@index\` (스키마 쪽)
    `.trim(),
    expectedOutput: 'GET /posts 라우트에서 $transaction + include + take 등장'
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

  // TODO: @@index([userId, createdAt]) 을 추가하세요.
}
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

// TODO: GET /posts?page=&size= 핸들러에서
//  - prisma.$transaction([findMany, count]) 사용
//  - findMany 에 take, skip, include: { author: true } 적용
//  - 응답: { items, total, page, size }

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /@@index\(\s*\[\s*userId\s*,\s*createdAt\s*\]\s*\)/,
        message: 'Post 모델에 @@index([userId, createdAt]) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.get\s*\(\s*['"`]\/posts['"`]/,
        message: 'GET /posts 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$transaction\s*\(/,
        message: 'prisma.$transaction 을 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /include\s*:\s*\{[\s\S]*author\s*:\s*true/,
        message: 'include: { author: true } 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /take\s*:/,
        message: 'take 옵션이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /(skip\s*:|cursor\s*:)/,
        message: 'skip 또는 cursor 페이징 옵션이 필요합니다.'
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
      content: 'query string 은 `request.query` 로 접근합니다. 숫자는 `Number(...)` 로 변환하세요.'
    },
    {
      level: 2,
      content: 'transaction 배열은 두 개의 Prisma 호출(`findMany`, `count`) 을 묶어 한 번의 라운드트립으로 처리합니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'
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
`
    }
  ]
}
