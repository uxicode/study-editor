import type { CurriculumStep } from '@/types/curriculum'

export const week_1_4: CurriculumStep = {
  id: 'week-1-4',
  title: '1주차 · JSON Schema 입력 검증',
  order: 4,
  category: 'environment',
  content: {
    mission:
      '`POST /users` 라우트에 JSON Schema 를 추가하여 `name` 과 `email` 필드를 런타임에서 검증하도록 만드세요.',
    theory: `
      Fastify 의 가장 강력한 기능 중 하나는 라우트마다 **JSON Schema** 를 붙여 입력을 자동 검증한다는 점입니다.

      ## 스키마 정의

      \`\`\`ts
      const createUserSchema = {
        body: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: { type: 'string', minLength: 1 },
            email: { type: 'string', format: 'email' }
          }
        }
      } as const
      \`\`\`

      ## 라우트에 적용

      \`\`\`ts
      fastify.post('/users', { schema: createUserSchema }, async (request, reply) => {
        return reply.code(201).send({ ok: true })
      })
      \`\`\`

      검증에 실패하면 Fastify 가 자동으로 \`400 Bad Request\` 를 응답해줍니다.

      ## response 스키마

      \`response: { 200: { type: 'object', properties: {...} } }\` 처럼 응답도 함께 정의하면, 직렬화가 최적화되어 응답 속도가 빨라집니다.
    `,
    objectives: [
      'JSON Schema 의 body 정의',
      '`required` / `properties` 의 역할 이해',
      '검증 실패 시 Fastify 의 자동 응답 흐름 이해'
    ],
    exercise: `
1. \`POST /users\` 라우트의 두 번째 인자에 \`schema\` 를 전달하세요.
2. \`body\` 에 \`type: 'object'\`, \`required: ['name', 'email']\`, \`properties: { name, email }\` 를 정의하세요.
3. 핸들러 내부에서 검증 통과된 \`request.body\` 를 사용해 응답하세요.
    `.trim(),
    expectedOutput: '라우트 schema 검증 사용'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

// TODO: createUserSchema 를 정의하고 POST /users 에 적용하세요.
fastify.post('/users', async (request, reply) => {
  return reply.code(201).send({ created: true })
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /schema\s*:/,
        message: '라우트 옵션에 schema 를 추가해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /body\s*:\s*\{/,
        message: 'schema 객체 안에 body 키가 있어야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /required\s*:\s*\[/,
        message: 'required 배열로 필수 필드를 명시해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /properties\s*:\s*\{/,
        message: 'properties 객체로 각 필드 타입을 정의해야 합니다.'
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
      content: '라우트 메서드의 두 번째 인자에 `{ schema: { body: { ... } } }` 를 전달합니다.'
    },
    {
      level: 2,
      content: 'JSON Schema 의 body 는 `type: \'object\'`, `required: [...]`, `properties: { ... }` 의 세 가지 핵심 키를 가집니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

const createUserSchema = {
  body: {
    type: 'object',
    required: ['name', 'email'],
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' }
    }
  }
} as const

fastify.post('/users', { schema: createUserSchema }, async (request, reply) => {
  return reply.code(201).send({ created: true, body: request.body })
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
