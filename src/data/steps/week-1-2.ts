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
      Fastify 핸들러는 항상 두 개의 인자 \`(request, reply)\` 를 받습니다.
      \`request\` 는 **들어온 요청을 읽는 객체**, \`reply\` 는 **응답을 만들어 내보내는 객체** 입니다.
      이 둘의 역할을 분리해서 이해하는 것이 Fastify 코드를 읽고 쓰는 출발점입니다.

      ## 1. request — 요청에서 값 꺼내기

      ### request.body — 요청 본문
      클라이언트가 보낸 payload. Fastify 가 Content-Type 헤더를 보고 **자동으로 파싱**해 줍니다.

      | Content-Type | request.body 의 형태 |
      |---|---|
      | \`application/json\` | 객체 (자동 \`JSON.parse\`) |
      | \`application/x-www-form-urlencoded\` | 객체 (\`@fastify/formbody\` 플러그인 필요) |
      | \`text/plain\` | 문자열 |
      | GET · DELETE 등 본문 없음 | \`undefined\` |
      \`\`\`ts
      fastify.post<{ Body: { name: string; email: string } }>('/users', async (request, reply) => {
        // 제네릭을 사용하면 request.body의 타입을 안전하게 추론할 수 있습니다.
        const { name, email } = request.body
        return reply.code(201).send({ name, email })
      })
      \`\`\`

      ### request.query — 쿼리스트링
      \`/posts?page=2&limit=10\` 같은 \`?\` 뒤의 값을 객체로 변환한 것입니다.
      **schema 를 지정하지 않으면 모든 값이 문자열** 이라는 점이 가장 자주 실수하는 부분입니다.

      \`\`\`ts
      fastify.get('/posts', async (request) => {
        const { page = '1', limit = '20' } = request.query as Record<string, string>
        return { page: Number(page), limit: Number(limit) }   // 명시적 변환 필수
      })
      \`\`\`

      ### request.params — URL 경로 파라미터
      경로 패턴의 \`:id\` 같은 콜론 변수에 매칭된 값입니다. 역시 **항상 문자열** 입니다.

      \`\`\`ts
      fastify.get('/users/:id', async (request) => {
        const { id } = request.params as { id: string }
        return { userId: id }
      })
      \`\`\`

      ### 그 외 자주 쓰는 것
      - \`request.headers\` — 모든 헤더 (이름은 소문자로 정규화)
      - \`request.ip\` — 클라이언트 IP
      - \`request.log\` — 요청 전용 로거 (요청 id 가 자동 포함되어 추적이 쉬움)

      ## 2. reply — 응답 만들어 보내기

      ### reply.code(status).send(payload)
      상태 코드를 정한 뒤 본문을 전송합니다. \`code\` · \`send\` · \`header\` 는 **체이닝** 가능합니다.

      | payload 타입 | Fastify 가 해 주는 일 |
      |---|---|
      | 객체 · 배열 | \`JSON.stringify\` + \`Content-Type: application/json\` |
      | 문자열 | \`Content-Type: text/plain\` |
      | \`Buffer\` · \`Stream\` | 그대로 흘려보냄 (이미지/파일 응답에 유용) |
      | \`null\` · \`undefined\` | 빈 본문 (보통 \`reply.code(204).send()\` 와 함께) |

      > **주의**: \`send()\` 는 한 요청당 한 번만 호출해야 합니다.
      > 두 번 부르면 \`FST_ERR_REP_ALREADY_SENT\` 가 발생합니다.

      ### reply.header(name, value) / reply.headers({...})
      응답 헤더를 추가합니다. **\`send\` 가 호출되기 전에** 지정해야 적용됩니다.

      \`\`\`ts
      reply
        .header('x-request-id', request.id)
        .code(200)
        .send({ ok: true })

      // 여러 개를 한 번에 지정
      reply.headers({ 'x-foo': '1', 'x-bar': '2' }).send({ ok: true })
      \`\`\`

      ### return = 자동 send
      \`async\` 핸들러에서 값을 \`return\` 하면 Fastify 가 자동으로 \`reply.send(값)\` 으로 보내 줍니다.
      가장 깔끔한 패턴이며 \`try/catch\` 와 같은 에러 흐름도 자연스럽게 이어집니다.

      \`\`\`ts
      // ✅ 단순 응답은 return 하나로 끝
      fastify.get('/me', async () => ({ id: 1, name: 'Alice' }))

      // ✅ 상태 코드/헤더 조작이 필요할 땐 reply 를 쓰고, 결과를 그대로 return
      fastify.post('/users', async (request, reply) => {
        return reply.code(201).send({ created: true })
      })
      \`\`\`

      > \`reply.send()\` 를 호출만 하고 결과를 \`return\` 하지 않으면 \`onResponse\` 같은
      > 일부 라이프사이클 훅이 어긋날 수 있습니다. \`return reply.code(...).send(...)\` 형태로
      > 항상 같이 쓰세요.

      ## 3. 이번 단계에서 만들 코드

      \`\`\`ts
      fastify.post('/echo', async (request, reply) => {
        return reply.code(201).send({
          received: request.body,
          at: new Date().toISOString()
        })
      })
      \`\`\`

      - \`POST\` 요청의 본문(\`request.body\`)을 그대로 받아
      - \`201 Created\` 상태로
      - JSON 응답에 \`received\` · \`at\` 두 필드를 담아 돌려줍니다.
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
