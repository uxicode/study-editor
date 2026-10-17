import type { CurriculumStep } from '@/types/curriculum'

export const week_3_5_p3: CurriculumStep = {
  id: 'week-3-5-p3',
  title: '2주차 · 연습 ③ 레이어드 아키텍처 — 인터페이스로 의존성 역전',
  order: 48,
  category: 'advanced',
  content: {
    mission:
      'repository 파일에 `export interface UserRepositoryPort` (`findAll`, `findById`, `findByEmail`, `create`)를 정의하고, `UserService` 가 `constructor(private readonly repo: UserRepositoryPort)` 로 이 인터페이스에 의존하게 바꾸세요. 테스트에서 `fake` repository 를 넣을 수 있다는 장점을 `//` 주석으로 적으세요.',
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
      '인터페이스 의존과 테스트 용이성 이해',
      '직전 스텝(레이어드 아키텍처)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '인터페이스로 의존성 역전 — 모든 채점 항목 통과'
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
        pattern: /export\s+interface\s+UserRepositoryPort/,
        message: 'export interface UserRepositoryPort 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /constructor\s*\(\s*private\s+readonly\s+\w+\s*:\s*UserRepositoryPort/,
        message: 'UserService 가 UserRepositoryPort 에 의존해야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /\/\/[^\n]*(fake|가짜|테스트)/i,
        message: '테스트에서 fake repository 를 주입할 수 있다는 장점을 // 주석으로 적어야 합니다.'
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
      content: 'repository 파일에 `export interface UserRepositoryPort`, service 에는 `constructor(private readonly repo: UserRepositoryPort)`. 주석에 `fake` 또는 `테스트` 를 언급하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- export interface UserRepositoryPort 가 필요합니다.
- UserService 가 UserRepositoryPort 에 의존해야 합니다.
- 테스트에서 fake repository 를 주입할 수 있다는 장점을 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts
export interface UserRepositoryPort {
  findAll(): Promise<unknown[]>
  findById(id: number): Promise<unknown | null>
  findByEmail(email: string): Promise<unknown | null>
  create(data: { email: string; name?: string }): Promise<unknown>
}

// src/users/user.service.ts
import { UserRepositoryPort } from './user.repository'

export class UserService {
  // 인터페이스에 의존하므로 테스트에서 fake repository 를 주입할 수 있습니다.
  constructor(private readonly repo: UserRepositoryPort) {}
  // ...
}
`
    }
  ]
}
