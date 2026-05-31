import type { CurriculumStep } from '@/types/curriculum'

export const week_1_2: CurriculumStep = {
  id: 'week-1-2',
  title: '1주차 · 라우트 핸들러와 reply',
  order: 2,
  category: 'environment',
  content: {
    mission:
      '`POST /echo` 라우트를 추가하여 `request.body` 를 그대로 받아 `reply.code(201).send(...)` 로 응답하도록 구현하세요.',
    theory: `
      Fastify 핸들러는 두 개의 인자 \`(request, reply)\` 를 받습니다.

      ## request

      - \`request.body\` — JSON 으로 자동 파싱된 요청 본문
      - \`request.query\` — 쿼리스트링 객체
      - \`request.params\` — \`:id\` 같은 URL 파라미터

      ## reply

      - \`reply.code(201).send({...})\` — 상태 코드를 지정한 후 본문을 전송
      - \`reply.header('x-custom', 'value')\` — 커스텀 헤더 추가
      - return 값이 있으면 자동으로 \`reply.send\` 와 동일하게 동작

      ## POST 본문 받기

      \`\`\`ts
      fastify.post('/echo', async (request, reply) => {
        return reply.code(201).send({
          received: request.body,
          at: new Date().toISOString()
        })
      })
      \`\`\`
    `,
    objectives: [
      'request / reply 객체의 역할 구분',
      'POST 메서드와 body 처리 방법 이해',
      'reply.code() 로 상태 코드 명시'
    ],
    exercise: `
1. 기존 \`GET /health\` 라우트는 그대로 두세요.
2. \`POST /echo\` 라우트를 추가하세요.
3. 핸들러 안에서 \`reply.code(201).send({ received: request.body })\` 를 호출하세요.
    `.trim(),
    expectedOutput: '등록된 라우트: GET /health, POST /echo'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.get('/health', async () => ({ status: 'ok' }))

// TODO: POST /echo 라우트를 추가하세요.
//  - request.body 를 그대로 받아 reply.code(201).send({ received: ... }) 로 응답합니다.

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.post\s*\(\s*['"`]\/echo['"`]/,
        message: 'POST /echo 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /reply\.code\s*\(\s*201/,
        message: 'reply.code(201) 로 상태 코드를 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.send\s*\(/,
        message: 'reply.send() 로 응답 본문을 전송해야 합니다.'
      },
      {
        type: 'includes',
        target: 'server.ts',
        pattern: 'request.body',
        message: 'request.body 를 사용해야 합니다.'
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
      content: 'POST 라우트는 `fastify.post(\'/echo\', (request, reply) => { ... })` 형태입니다.'
    },
    {
      level: 2,
      content: 'reply 메서드는 체이닝됩니다: `reply.code(201).send(data)`.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.get('/health', async () => ({ status: 'ok' }))

fastify.post('/echo', async (request, reply) => {
  return reply.code(201).send({
    received: request.body,
    at: new Date().toISOString()
  })
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
