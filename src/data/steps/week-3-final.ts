import type { CurriculumStep } from '@/types/curriculum'

export const week_3_final: CurriculumStep = {
  id: 'week-3-final',
  title: '3주차 종합 · Fastify + Prisma 사용자 API',
  order: 18,
  category: 'advanced',
  content: {
    mission:
      'Fastify 라우트와 service / repository 레이어를 결합하여 `GET /users` 와 `POST /users` 를 모두 동작시키는 사용자 관리 API 를 완성하세요.',
    theory: `
      이번 주에 배운 모든 개념을 합칩니다.

      1. **schema.prisma** — \`User\` 모델 정의
      2. **user.repository.ts** — Prisma 호출 (\`findMany\`, \`create\`)
      3. **user.service.ts** — repository 를 의존성으로 받아 도메인 로직 제공
      4. **server.ts** — Fastify 가 service 만 호출, JSON Schema 로 입력 검증

      ## 데이터 흐름

      \`\`\`
      POST /users  →  schema 검증
                  →  service.register(body)
                  →  repository.create(data)
                  →  prisma.user.create
      GET  /users  →  service.list()
                  →  repository.findAll()
                  →  prisma.user.findMany
      \`\`\`

      ## 검증 포인트
      - service / repository 가 분리되어 있는가?
      - 라우트에 JSON Schema 가 적용되었는가?
      - 두 라우트 모두 정상 등록되었는가?
    `,
    objectives: [
      '레이어드 아키텍처를 작은 실전 API 에 적용',
      'Fastify schema 와 Prisma 를 함께 사용',
      '의존성 주입 패턴 익히기'
    ],
    exercise: `
1. \`UserRepository\` 와 \`UserService\` 를 완성하세요 (앞 스텝의 결과를 그대로 사용해도 됩니다).
2. \`server.ts\` 에 \`GET /users\` 와 \`POST /users\` 두 라우트를 등록하세요.
3. \`POST /users\` 에는 \`schema.body\` 로 \`email\` 필수 검증을 적용하세요.
    `.trim(),
    expectedOutput: 'GET /users, POST /users 모두 등록 + service / repository 분리'
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
`
    },
    {
      name: 'user.repository.ts',
      path: 'src/users/user.repository.ts',
      language: 'typescript',
      content: `// TODO: PrismaClient 를 사용하여 findAll, create 메서드를 가진 UserRepository 를 만드세요.
`
    },
    {
      name: 'user.service.ts',
      path: 'src/users/user.service.ts',
      language: 'typescript',
      content: `// TODO: UserRepository 를 의존성으로 받는 UserService 를 만드세요.
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'
// TODO: service 와 repository 를 import / 생성하세요.

const fastify = Fastify({ logger: true })

// TODO: GET /users — service.list() 결과 반환
// TODO: POST /users — schema.body 로 email 필수 검증 후 service.register(body)

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'src/users/user.repository.ts',
        pattern: /export\s+(class|function|const)\s+\w*User\w*Repository/,
        message: 'UserRepository 가 정의되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /export\s+(class|function|const)\s+\w*User\w*Service/,
        message: 'UserService 가 정의되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /from\s+['"][^'"]*user\.service['"]/,
        message: 'server.ts 가 user.service 를 import 해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.get\s*\(\s*['"`]\/users['"`]/,
        message: 'GET /users 라우트가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.post\s*\(\s*['"`]\/users['"`]/,
        message: 'POST /users 라우트가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /schema\s*:/,
        message: 'POST /users 라우트에 schema 옵션이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /body\s*:\s*\{/,
        message: 'schema 안에 body 객체가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /required\s*:\s*\[/,
        message: 'body 안에 required 배열이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.listen\s*\(/,
        message: 'fastify.listen 으로 서버를 시작해야 합니다.'
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
      content: 'service 는 `register(body)` 안에서 입력을 검증하거나 가공한 뒤 repository.create 를 호출합니다.'
    },
    {
      level: 2,
      content: 'POST 의 schema.body 는 `{ type: \'object\', required: [\'email\'], properties: { email: { type: \'string\' } } }` 형태입니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts
import { PrismaClient } from '@prisma/client'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  findAll() { return this.prisma.user.findMany() }
  create(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data })
  }
}

// src/users/user.service.ts
import { UserRepository } from './user.repository'

export class UserService {
  constructor(private readonly repo: UserRepository) {}
  list() { return this.repo.findAll() }
  register(input: { email: string; name?: string }) {
    return this.repo.create(input)
  }
}

// server.ts
import Fastify from 'fastify'
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
`
    }
  ]
}
