import type { CurriculumStep } from '@/types/curriculum'

export const week_3_5_p1: CurriculumStep = {
  id: 'week-3-5-p1',
  title: '2주차 · 연습 ① 레이어드 아키텍처 — findById 와 USER_NOT_FOUND',
  order: 46,
  category: 'advanced',
  content: {
    mission:
      '`UserRepository.findById(id)` 와 `UserService.getUser(id)` 를 추가하세요. 없는 id 면 service 에서 `throw new Error(\'USER_NOT_FOUND\')` 를 던집니다. ("없으면 에러" 는 service 의 책임입니다.)',
    theory: `
      ## 복습: 레이어드 아키텍처

      - **route** 는 HTTP 만, **service** 는 비즈니스 규칙, **repository** 는 DB 접근만 담당합니다.
      - "없으면 에러", "중복이면 에러" 같은 규칙은 service 의 책임입니다.
      - service 가 구체 클래스 대신 **인터페이스**에 의존하면 테스트에서 fake 를 주입할 수 있습니다.

      \`\`\`ts
      export interface UserRepositoryPort { findAll(): Promise<unknown[]> /* ... */ }
      constructor(private readonly repo: UserRepositoryPort) {}
      \`\`\`
    `,
    objectives: [
      '"없으면 에러" 규칙을 service 에 두기',
      '직전 스텝(레이어드 아키텍처)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'findById 와 USER_NOT_FOUND — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'user.repository.ts',
      path: 'src/users/user.repository.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.user.findMany()
  }

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

  list() {
    return this.repo.findAll()
  }

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
const prisma = new PrismaClient()
const service = new UserService(new UserRepository(prisma))

fastify.get('/users', async () => service.list())

fastify.listen({ port: 3000, host: '0.0.0.0' })

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'src/users/user.repository.ts',
        pattern: /findById\s*\(/,
        message: 'repository 에 findById 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /getUser\s*\(/,
        message: 'service 에 getUser 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /throw\s+new\s+Error\(\s*['"]USER_NOT_FOUND['"]\s*\)/,
        message: '없는 사용자는 throw new Error(\'USER_NOT_FOUND\') 를 던져야 합니다.'
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
      content: 'repository 에 `findById(id)`, service 에 `getUser(id)` 를 만들고 결과가 없으면 `throw new Error(\'USER_NOT_FOUND\')`.'
    },
    {
      level: 2,
      content: `채점 항목:
- repository 에 findById 가 필요합니다.
- service 에 getUser 가 필요합니다.
- 없는 사용자는 throw new Error('USER_NOT_FOUND') 를 던져야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts — 메서드 추가
findById(id: number) {
  return this.prisma.user.findUnique({ where: { id } })
}

// src/users/user.service.ts — 메서드 추가
async getUser(id: number) {
  const user = await this.repo.findById(id)
  if (!user) throw new Error('USER_NOT_FOUND')
  return user
}
`
    }
  ]
}
