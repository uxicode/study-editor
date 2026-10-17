import type { CurriculumStep } from '@/types/curriculum'

export const week_3_final_p2: CurriculumStep = {
  id: 'week-3-final-p2',
  title: '2주차 · 연습 ② Fastify + Prisma 사용자 API — 본문 스키마 엄격하게',
  order: 51,
  category: 'advanced',
  content: {
    mission:
      '`POST /users` 의 `schema.body` 를 보강하세요: `email` 에 `maxLength: 255`, `name` 에 `maxLength: 100` 을 두고, 알 수 없는 필드는 `additionalProperties: false` 로 거부합니다.',
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
      'maxLength · additionalProperties 로 입력 제한',
      '직전 스텝(Fastify + Prisma 사용자 API)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '본문 스키마 엄격하게 — 모든 채점 항목 통과'
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
        pattern: /maxLength\s*:\s*255/,
        message: 'email 에 maxLength: 255 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /maxLength\s*:\s*100/,
        message: 'name 에 maxLength: 100 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /additionalProperties\s*:\s*false/,
        message: 'additionalProperties: false 가 필요합니다.'
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
      content: '`createSchema.body` 에 `additionalProperties: false`, `email` 의 `maxLength: 255`, `name` 의 `maxLength: 100`.'
    },
    {
      level: 2,
      content: `채점 항목:
- email 에 maxLength: 255 가 필요합니다.
- name 에 maxLength: 100 이 필요합니다.
- additionalProperties: false 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// server.ts
const createSchema = {
  body: {
    type: 'object',
    required: ['email'],
    additionalProperties: false,
    properties: {
      email: { type: 'string', format: 'email', maxLength: 255 },
      name:  { type: 'string', maxLength: 100 }
    }
  }
} as const
`
    }
  ]
}
