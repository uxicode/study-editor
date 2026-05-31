import type { CurriculumStep } from '@/types/curriculum'

export const week_1_3: CurriculumStep = {
  id: 'week-1-3',
  title: '1주차 · TypeScript 라우트 타입',
  order: 3,
  category: 'environment',
  content: {
    mission:
      '`FastifyRequest<{ Body: { name: string } }>` 제네릭을 사용하여 `POST /users` 의 본문 타입을 좁혀, 핸들러 안에서 `request.body.name` 이 안전하게 타입 추론되도록 만드세요.',
    theory: `
      Fastify 는 라우트 시그니처에 제네릭을 받아 \`Body\`, \`Querystring\`, \`Params\`, \`Headers\` 의 타입을 좁힐 수 있습니다.

      ## FastifyRequest 제네릭

      \`\`\`ts
      import type { FastifyRequest, FastifyReply } from 'fastify'

      type CreateUserBody = { name: string; email: string }

      fastify.post('/users', async (
        request: FastifyRequest<{ Body: CreateUserBody }>,
        reply: FastifyReply
      ) => {
        const { name, email } = request.body // ✅ 정확히 타입 추론됨
        return reply.code(201).send({ name, email })
      })
      \`\`\`

      ## 라우트 옵션 객체 스타일

      또는 \`RouteShorthandOptionsWithHandler\` 형태로 \`schema\` 까지 함께 정의할 수 있습니다.

      ## 핵심
      - 런타임 검증은 다음 스텝의 JSON Schema 에서, **컴파일 타임 안전성은 제네릭**에서 얻습니다.
      - 두 가지를 함께 쓰면 가장 견고한 핸들러가 됩니다.
    `,
    objectives: [
      'FastifyRequest 제네릭의 의미 이해',
      'Body / Querystring / Params 타입 좁히기',
      '핸들러 매개변수의 명시적 타입 표기'
    ],
    exercise: `
1. \`from 'fastify'\` 에서 \`FastifyRequest\` 와 \`FastifyReply\` 를 type import 하세요.
2. \`POST /users\` 핸들러를 추가하고 \`FastifyRequest<{ Body: { name: string; email: string } }>\` 로 타입을 좁히세요.
3. \`request.body.name\` 을 사용해 \`reply.code(201).send({ created: name })\` 를 호출하세요.
    `.trim(),
    expectedOutput: '등록된 라우트: POST /users'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'
// TODO: FastifyRequest, FastifyReply 를 type import 하세요.

const fastify = Fastify({ logger: true })

// TODO: POST /users 핸들러를 추가하고
//       FastifyRequest<{ Body: { name: string; email: string } }> 로 타입을 좁히세요.

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'server.ts',
        pattern: 'FastifyRequest<',
        message: 'FastifyRequest 제네릭을 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /Body\s*:/,
        message: '제네릭에 Body 타입을 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.post\s*\(\s*['"`]\/users['"`]/,
        message: 'POST /users 라우트를 등록해야 합니다.'
      },
      {
        type: 'includes',
        target: 'server.ts',
        pattern: 'request.body',
        message: '핸들러 안에서 request.body 를 사용해야 합니다.'
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
      content: '`import type { FastifyRequest, FastifyReply } from \'fastify\'` 로 타입만 가져올 수 있습니다.'
    },
    {
      level: 2,
      content: '핸들러 매개변수에 `request: FastifyRequest<{ Body: { name: string; email: string } }>` 처럼 타입을 직접 명시할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'
import type { FastifyRequest, FastifyReply } from 'fastify'

const fastify = Fastify({ logger: true })

type CreateUserBody = { name: string; email: string }

fastify.post('/users', async (
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply
) => {
  const { name, email } = request.body
  return reply.code(201).send({ created: name, email })
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
