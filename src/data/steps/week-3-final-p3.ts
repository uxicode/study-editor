import type { CurriculumStep } from '@/types/curriculum'

export const week_3_final_p3: CurriculumStep = {
  id: 'week-3-final-p3',
  title: '2주차 · 연습 ③ Fastify + Prisma 사용자 API — DELETE /users/:id 와 204',
  order: 52,
  category: 'advanced',
  content: {
    mission:
      '`DELETE /users/:id` 라우트를 추가해 성공 시 `reply.code(204).send()` 로 응답하세요. repository 에는 `delete(id)` (`prisma.user.delete`), service 에는 `remove(id)` 를 만들어 레이어 순서(route → service → repository)를 지킵니다.',
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
      '3개 레이어를 모두 거치는 삭제 기능',
      '직전 스텝(Fastify + Prisma 사용자 API)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'DELETE /users/:id 와 204 — 모든 채점 항목 통과'
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
        pattern: /\.delete\s*\(\s*['"`]\/users\/:id['"`]/,
        message: 'DELETE /users/:id 라우트가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /code\s*\(\s*204\s*\)/,
        message: '삭제 성공 시 reply.code(204) 로 응답해야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.repository.ts',
        pattern: /\.user\.delete\s*\(/,
        message: 'repository 에서 prisma.user.delete 를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /\bremove\s*\(/,
        message: 'service 에 remove(id) 메서드가 필요합니다.'
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
      content: 'repository `delete(id)` (`prisma.user.delete`), service `remove(id)`, route 는 `reply.code(204).send()`.'
    },
    {
      level: 2,
      content: `채점 항목:
- DELETE /users/:id 라우트가 필요합니다.
- 삭제 성공 시 reply.code(204) 로 응답해야 합니다.
- repository 에서 prisma.user.delete 를 호출해야 합니다.
- service 에 remove(id) 메서드가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts
delete(id: number) { return this.prisma.user.delete({ where: { id } }) }

// src/users/user.service.ts
remove(id: number) { return this.repo.delete(id) }

// server.ts
fastify.delete('/users/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  await service.remove(Number(id))
  return reply.code(204).send()
})
`
    }
  ]
}
