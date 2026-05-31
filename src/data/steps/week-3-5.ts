import type { CurriculumStep } from '@/types/curriculum'

export const week_3_5: CurriculumStep = {
  id: 'week-3-5',
  title: '3주차 · 레이어드 아키텍처',
  order: 17,
  category: 'advanced',
  content: {
    mission:
      'Fastify 라우트가 Prisma 를 직접 호출하지 않도록, `UserRepository` 와 `UserService` 두 레이어를 분리한 뒤 `server.ts` 가 service 만 호출하도록 리팩터링하세요.',
    theory: `
      ## 왜 레이어를 나누는가

      - 라우트는 HTTP 입출력만 책임 (request 받기 / response 보내기)
      - service 는 비즈니스 규칙
      - repository 는 데이터 액세스 (Prisma 호출)

      이렇게 나누면 테스트 시 repository 를 mock 으로 갈아끼우기 쉬워지고, 코드 변경의 영향 범위가 좁아집니다.

      ## 파일 구성

      \`\`\`
      src/
        users/
          user.repository.ts   ← Prisma 호출
          user.service.ts      ← 도메인 로직
      server.ts                ← Fastify 라우트, service 호출
      \`\`\`

      ## 의존성 방향

      \`route → service → repository → prisma\`

      반대 방향으로 흘려서는 안 됩니다. 라우트가 repository 를 직접 부르면 레이어가 깨집니다.
    `,
    objectives: [
      '책임을 가진 레이어로 분리',
      'service ↔ repository 의 인터페이스 설계',
      'server.ts 에서 service 만 의존하도록 정리'
    ],
    exercise: `
1. \`src/users/user.repository.ts\` 에 \`UserRepository\` 클래스(또는 named export 함수들) 를 만들고 \`findAll\`, \`create\` 메서드를 구현하세요. 내부에서 prisma 를 호출합니다.
2. \`src/users/user.service.ts\` 에 \`UserService\` 를 만들고 repository 를 의존성으로 받습니다.
3. \`server.ts\` 에서 \`UserService\` 만 import 하여 라우트가 service 메서드를 호출하도록 하세요.
    `.trim(),
    expectedOutput: 'repository / service / server.ts 가 분리되어 있음'
  },
  initialFiles: [
    {
      name: 'user.repository.ts',
      path: 'src/users/user.repository.ts',
      language: 'typescript',
      content: `// TODO: PrismaClient 를 import 하여 UserRepository 를 만드세요.
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
// TODO: ./src/users/user.service 의 UserService 를 import 하세요.

const fastify = Fastify({ logger: true })

// TODO: GET /users 라우트에서 service.findAll() 을 호출하여 반환하세요.

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'src/users/user.repository.ts',
        pattern: /export\s+(class|function|const)\s+\w*User/,
        message: 'user.repository.ts 에 User 관련 export 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.repository.ts',
        pattern: /PrismaClient|@prisma\/client/,
        message: 'repository 가 PrismaClient 를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /export\s+(class|function|const)\s+\w*User/,
        message: 'user.service.ts 에 User 관련 export 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'src/users/user.service.ts',
        pattern: /from\s+['"]\.\/user\.repository['"]|from\s+['"]\.\.\/users\/user\.repository['"]/,
        message: 'service 가 repository 를 import 해야 합니다.'
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
        message: 'GET /users 라우트를 등록해야 합니다.'
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
      content: '클래스 기반이든 함수 기반이든 OK 입니다. 핵심은 layer 가 분리되어 있다는 점입니다.'
    },
    {
      level: 2,
      content: 'service 는 repository 를 생성자 주입(constructor injection) 으로 받는 것이 테스트하기 좋습니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// src/users/user.repository.ts
import { PrismaClient } from '@prisma/client'

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findAll() {
    return this.prisma.user.findMany()
  }

  create(data: { email: string; name?: string }) {
    return this.prisma.user.create({ data })
  }
}

// src/users/user.service.ts
import { UserRepository } from './user.repository'

export class UserService {
  constructor(private readonly repo: UserRepository) {}

  list() {
    return this.repo.findAll()
  }

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
const prisma = new PrismaClient()
const service = new UserService(new UserRepository(prisma))

fastify.get('/users', async () => service.list())

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
