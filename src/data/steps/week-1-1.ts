import type { CurriculumStep } from '@/types/curriculum'

export const week_1_1: CurriculumStep = {
  id: 'week-1-1',
  title: '1주차 · Fastify 부트스트랩',
  order: 1,
  category: 'environment',
  content: {
    mission:
      'Fastify 인스턴스를 생성하고 `GET /health` 헬스체크 라우트를 등록한 뒤 3000 포트에서 서버를 띄우는 `server.ts` 를 작성하세요.',
    theory: `
      **Fastify** 는 Node.js 진영에서 가장 빠른 웹 프레임워크 중 하나로, JSON Schema 기반의 강력한 입력 검증과 플러그인 시스템을 제공합니다.

      ## 1. 인스턴스 생성

      \`\`\`ts
      import Fastify from 'fastify'

      const fastify = Fastify({ logger: true })
      \`\`\`

      - \`logger: true\` 를 켜면 들어온 요청·응답이 자동 로깅되어 디버깅이 쉬워집니다.
      - 반환된 \`fastify\` 인스턴스에 라우트와 플러그인을 등록합니다.

      ## 2. 라우트 등록

      \`\`\`ts
      fastify.get('/health', async () => ({ status: 'ok' }))
      \`\`\`

      - 핸들러는 \`async\` 함수로 작성하고, return 값이 자동으로 JSON 직렬화됩니다.
      - HTTP 메서드별 메서드 (\`get\`, \`post\`, \`put\`, \`delete\`, \`patch\`) 가 모두 지원됩니다.

      ## 3. listen 호출

      \`\`\`ts
      await fastify.listen({ port: 3000, host: '0.0.0.0' })
      \`\`\`

      - \`listen\` 은 Promise 를 반환하므로 \`await\` 또는 \`.then\` 으로 처리합니다.
      - 운영 환경에서 \`host: '0.0.0.0'\` 을 지정해야 컨테이너 외부에서 접근됩니다.
    `,
    objectives: [
      'Fastify 인스턴스를 생성하는 방법 이해',
      '`get` 메서드로 라우트를 등록하는 패턴 익히기',
      '`fastify.listen` 으로 HTTP 서버를 시작하는 방법 학습'
    ],
    exercise: `
1. \`server.ts\` 상단에서 \`fastify\` 패키지를 import 하세요.
2. \`Fastify({ logger: true })\` 로 인스턴스를 생성하세요.
3. \`GET /health\` 라우트가 \`{ status: 'ok' }\` 를 반환하도록 만드세요.
4. \`fastify.listen({ port: 3000 })\` 을 호출하여 서버를 시작하세요.
    `.trim(),
    expectedOutput: '등록된 라우트: GET /health\nFastify 서버가 시작될 준비가 되었습니다.'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `// TODO: Fastify 를 import 하고 인스턴스를 생성하세요.
// TODO: GET /health 라우트를 등록하세요.
// TODO: fastify.listen({ port: 3000 }) 으로 서버를 시작하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /from\s+['"]fastify['"]/,
        message: 'server.ts 에서 fastify 를 import 해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /Fastify\s*\(/,
        message: 'Fastify(...) 로 인스턴스를 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.get\s*\(\s*['"`]\/health['"`]/,
        message: 'GET /health 라우트를 등록해야 합니다.'
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
      content: 'Fastify 는 default export 이므로 `import Fastify from \'fastify\'` 로 가져옵니다.'
    },
    {
      level: 2,
      content: '`fastify.get(\'/health\', handler)` 형태로 라우트를 등록하고, async 함수에서 객체를 return 하면 JSON 응답이 됩니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.get('/health', async () => ({ status: 'ok' }))

fastify.listen({ port: 3000, host: '0.0.0.0' })
  .then(() => console.log('🚀 Fastify ready on http://localhost:3000'))
  .catch((err) => {
    fastify.log.error(err)
    process.exit(1)
  })
`
    }
  ]
}
