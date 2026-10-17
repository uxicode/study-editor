import type { CurriculumStep } from '@/types/curriculum'

export const week_3_5_p2: CurriculumStep = {
  id: 'week-3-5-p2',
  title: '2주차 · 연습 ② 레이어드 아키텍처 — 이메일 중복 검사',
  order: 47,
  category: 'advanced',
  content: {
    mission:
      '`UserRepository.findByEmail(email)` 을 만들고, `UserService.createUser` 에서 이를 호출해 이미 있는 이메일이면 에러를 던지게 하세요. 이 검사가 service 에 있어야 하는 이유를 `비즈니스` 라는 단어를 넣어 `//` 주석으로 적으세요.',
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
      '중복 검사가 service 에 있어야 하는 이유 이해',
      '직전 스텝(레이어드 아키텍처)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '이메일 중복 검사 — 모든 채점 항목 통과'
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
        pattern: /findByEmail\s*\(/,
        message: 'repository 에 findByEmail 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /createUser\s*\([\s\S]*?findByEmail\s*\(/,
        message: 'service.createUser 에서 findByEmail 로 중복을 확인해야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /\/\/[^\n]*비즈니스/,
        message: '중복 검사가 service 에 있어야 하는 이유를 // 주석으로 적어야 합니다.'
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
      content: 'repository 에 `findByEmail`, service 에 `createUser` 를 만들고 중복이면 에러를 던집니다. 주석에 `비즈니스` 라는 단어로 이유를 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- repository 에 findByEmail 이 필요합니다.
- service.createUser 에서 findByEmail 로 중복을 확인해야 합니다.
- 중복 검사가 service 에 있어야 하는 이유를 // 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts — 메서드 추가
findByEmail(email: string) {
  return this.prisma.user.findUnique({ where: { email } })
}

// src/users/user.service.ts — 메서드 추가
// 중복 검사는 비즈니스 규칙이므로 repository 가 아니라 service 에 둡니다.
async createUser(input: { email: string; name?: string }) {
  if (await this.repo.findByEmail(input.email)) throw new Error('EMAIL_TAKEN')
  return this.repo.create(input)
}
`
    }
  ]
}
