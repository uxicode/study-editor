import type { CurriculumStep } from '@/types/curriculum'

export const week_3_final_p1: CurriculumStep = {
  id: 'week-3-final-p1',
  title: '2주차 · 연습 ① Fastify + Prisma 사용자 API — GET /users/:id 와 404',
  order: 50,
  category: 'advanced',
  content: {
    mission:
      '`GET /users/:id` 라우트를 추가하세요. 사용자가 없으면 `reply.code(404).send({ message: \'Not Found\' })` 로 응답합니다.',
    theory: `
      ## 복습: Fastify 라우트 확장

      \`\`\`ts
      fastify.get('/users/:id', async (request, reply) => {
        const { id } = request.params as { id: string }
        // ...
        return reply.code(404).send({ message: 'Not Found' })
      })
      \`\`\`

      - 경로 파라미터는 \`request.params\`, 본문은 \`request.body\`.
      - JSON Schema 의 \`maxLength\`, \`additionalProperties: false\` 로 입력을 엄격하게 제한합니다.
      - 본문 없는 성공 응답은 \`204\`, 생성은 \`201\`, 없음은 \`404\` 입니다.
    `,
    objectives: [
      '경로 파라미터 조회와 404 응답',
      '직전 스텝(Fastify + Prisma 사용자 API)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'GET /users/:id 와 404 — 모든 채점 항목 통과'
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
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    },
    {
      name: 'user.repository.ts',
      path: 'src/users/user.repository.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  findAll() { return this.prisma.user.findMany() }
  create(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data })
  }
}

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    },
    {
      name: 'user.service.ts',
      path: 'src/users/user.service.ts',
      language: 'typescript',
      content: `import { UserRepository } from './user.repository'

export class UserService {
  constructor(private readonly repo: UserRepository) {}
  list() { return this.repo.findAll() }
  register(input: { email: string; name?: string }) {
    return this.repo.create(input)
  }
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
import { UserRepository } from './src/users/user.repository'
import { UserService } from './src/users/user.service'

const fastify = Fastify({ logger: true })
const service = new UserService(new UserRepository(new PrismaClient()))

const createSchema = {
  body: {
    type: 'object',
    required: ['email'],
    properties: {
      email: { type: 'string', format: 'email' },
      name:  { type: 'string' }
    }
  }
} as const

fastify.get('/users', async () => service.list())

fastify.post('/users', { schema: createSchema }, async (request, reply) => {
  const user = await service.register(request.body as { email: string; name?: string })
  return reply.code(201).send(user)
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
        pattern: /\.get\s*\(\s*['"`]\/users\/:id['"`]/,
        message: 'GET /users/:id 라우트가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /code\s*\(\s*404\s*\)/,
        message: '사용자가 없으면 reply.code(404) 로 응답해야 합니다.'
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
      content: '`fastify.get(\'/users/:id\', ...)` 에서 사용자가 없으면 `reply.code(404).send({ message: \'Not Found\' })`.'
    },
    {
      level: 2,
      content: `채점 항목:
- GET /users/:id 라우트가 필요합니다.
- 사용자가 없으면 reply.code(404) 로 응답해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// server.ts
fastify.get('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const user = await service.get(Number(id))
  if (!user) return reply.code(404).send({ message: 'Not Found' })
  return user
})
`
    }
  ]
}
