import type { CurriculumStep } from '@/types/curriculum'

export const week_1_5: CurriculumStep = {
  id: 'week-1-5',
  title: '1주차 · 플러그인과 데코레이터',
  order: 5,
  category: 'environment',
  content: {
    mission:
      '`fastify.register()` 로 CORS 플러그인을 등록하고, `fastify.decorate()` 로 공용 헬퍼 함수를 인스턴스에 부착하세요.',
    theory: `
      Fastify 는 모든 기능을 **플러그인** 으로 구성합니다.

      ## register

      \`\`\`ts
      import cors from '@fastify/cors'
      await fastify.register(cors, { origin: true })
      \`\`\`

      - 외부 패키지를 \`register\` 하여 라우트 전 단계에 미들웨어 / 훅을 추가
      - 각 plugin 은 독립된 encapsulation scope 를 가지므로, 충돌 없이 안전하게 조합 가능

      ## decorate

      \`\`\`ts
      fastify.decorate('config', { appName: 'study-editor' })
      fastify.decorate('helper', (n: number) => n * 2)
      \`\`\`

      - \`fastify.config\`, \`fastify.helper(2)\` 처럼 인스턴스에서 바로 접근
      - request / reply 도 \`decorateRequest\`, \`decorateReply\` 로 같은 방식으로 확장 가능

      ## 왜 중요한가?
      - 라우트 핸들러에 공통 의존성을 주입할 때 (DB, 캐시, config 등) 패턴이 통일됩니다.
      - 테스트 시 plugin 단위로 격리하여 검증할 수 있습니다.
    `,
    objectives: [
      'plugin 등록 흐름 이해',
      'decorate 로 인스턴스 확장하기',
      '공용 의존성 주입 패턴 익히기'
    ],
    exercise: `
1. \`fastify.register\` 호출을 추가하세요 (CORS 플러그인을 모방한 인라인 함수도 OK).
2. \`fastify.decorate('config', ...)\` 로 설정 객체를 등록하세요.
3. \`GET /info\` 라우트에서 \`fastify.config\` 또는 \`fastify.helper\` 를 사용해 응답하세요.
    `.trim(),
    expectedOutput: 'fastify.register 플러그인 등록, fastify.decorate 사용'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

// TODO: fastify.register(...) 로 플러그인을 등록하세요.
// TODO: fastify.decorate('config', { ... }) 로 인스턴스에 헬퍼를 부착하세요.
// TODO: GET /info 에서 fastify.config 를 응답하세요.

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.register\s*\(/,
        message: 'fastify.register 를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.decorate\s*\(/,
        message: 'fastify.decorate 를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.get\s*\(\s*['"`]\/info['"`]/,
        message: 'GET /info 라우트를 등록해야 합니다.'
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
      content: 'plugin 은 보통 `async function (fastify, opts) { ... }` 형태입니다. 외부 패키지 없이도 직접 정의해 register 할 수 있습니다.'
    },
    {
      level: 2,
      content: '`fastify.decorate(key, value)` 로 등록한 값은 `fastify.key` 처럼 인스턴스 속성으로 사용합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

async function corsPlugin(fastify: any) {
  fastify.addHook('onRequest', async (_req, reply) => {
    reply.header('access-control-allow-origin', '*')
  })
}

await fastify.register(corsPlugin)
fastify.decorate('config', { appName: 'study-editor', version: '0.1.0' })
fastify.decorate('helper', (n: number) => n * 2)

fastify.get('/info', async () => fastify.config)

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
