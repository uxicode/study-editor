import type { CurriculumStep } from '@/types/curriculum'

export const week_1_final: CurriculumStep = {
  id: 'week-1-final',
  title: '1주차 종합 · Todo API',
  order: 6,
  category: 'advanced',
  content: {
    mission:
      '`/todos` 리소스에 대해 `GET`, `POST`, `PUT`, `DELETE` 4개 라우트를 모두 구현하고, `POST` 와 `PUT` 에는 JSON Schema 입력 검증을 적용한 뒤 `listen` 으로 서버를 시작하세요.',
    theory: `
      1주차에서 다룬 모든 개념을 종합합니다.

      ## 라우트 설계

      | 메서드 | 경로 | 동작 |
      |--------|------|------|
      | GET    | /todos       | 전체 목록 조회 |
      | POST   | /todos       | 새 Todo 생성 (body: title) |
      | PUT    | /todos/:id   | Todo 수정 (body: title, done) |
      | DELETE | /todos/:id   | Todo 삭제 |

      ## 메모리 저장소

      실제 DB 는 다음 주에 다루므로, 모듈 스코프에 \`const todos: Todo[] = []\` 같은 배열을 두고 CRUD 를 흉내 냅니다.

      ## 검증 + 타입 + 플러그인을 한 번에

      - \`POST\` 의 body 에는 \`required: ['title']\` 을 가진 schema 를 적용
      - \`PUT\` 도 마찬가지로 body schema 와 params (\`:id\`) 를 검증
      - \`fastify.decorate('todos', todos)\` 로 저장소를 인스턴스에 부착해도 좋습니다.
    `,
    objectives: [
      '4가지 HTTP 메서드 통합 구현',
      'schema 기반 입력 검증 재확인',
      '하나의 server.ts 안에서 일관된 라우트 설계'
    ],
    exercise: `
1. \`Todo\` 인메모리 배열을 선언하세요.
2. \`GET /todos\`, \`POST /todos\`, \`PUT /todos/:id\`, \`DELETE /todos/:id\` 4개 라우트를 등록하세요.
3. \`POST\` 와 \`PUT\` 에는 \`schema.body\` 로 \`title\` 필수 검증을 추가하세요.
4. \`fastify.listen({ port: 3000 })\` 로 서버를 시작하세요.
    `.trim(),
    expectedOutput: 'GET /todos, POST /todos, PUT /todos/:id, DELETE /todos/:id'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

type Todo = { id: number; title: string; done: boolean }
const todos: Todo[] = []
let nextId = 1

// TODO: GET /todos  — 모든 todo 반환
// TODO: POST /todos — { title } 을 받아 새 todo 추가 (schema 검증 필요)
// TODO: PUT /todos/:id — { title?, done? } 으로 갱신 (schema 검증 필요)
// TODO: DELETE /todos/:id — 해당 todo 삭제

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.get\s*\(\s*['"`]\/todos['"`]/,
        message: 'GET /todos 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.post\s*\(\s*['"`]\/todos['"`]/,
        message: 'POST /todos 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.put\s*\(\s*['"`]\/todos\/:id['"`]/,
        message: 'PUT /todos/:id 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\.delete\s*\(\s*['"`]\/todos\/:id['"`]/,
        message: 'DELETE /todos/:id 라우트를 등록해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /schema\s*:/,
        message: 'POST / PUT 에는 schema 옵션을 적용해야 합니다.'
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
      content: '`PUT /todos/:id` 에서는 `request.params.id` 로 ID 를 받습니다. 숫자로 변환할 때 `Number(request.params.id)` 를 사용하세요.'
    },
    {
      level: 2,
      content: 'schema 객체는 라우트별로 재사용 가능합니다. 동일한 body 검증 로직을 변수에 담아 여러 라우트에 적용해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

type Todo = { id: number; title: string; done: boolean }
const todos: Todo[] = []
let nextId = 1

const createSchema = {
  body: {
    type: 'object',
    required: ['title'],
    properties: { title: { type: 'string', minLength: 1 } }
  }
} as const

const updateSchema = {
  params: {
    type: 'object',
    properties: { id: { type: 'string' } }
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      done: { type: 'boolean' }
    }
  }
} as const

fastify.get('/todos', async () => todos)

fastify.post('/todos', { schema: createSchema }, async (request, reply) => {
  const { title } = request.body as { title: string }
  const todo: Todo = { id: nextId++, title, done: false }
  todos.push(todo)
  return reply.code(201).send(todo)
})

fastify.put('/todos/:id', { schema: updateSchema }, async (request, reply) => {
  const id = Number((request.params as { id: string }).id)
  const todo = todos.find((t) => t.id === id)
  if (!todo) return reply.code(404).send({ error: 'not found' })
  Object.assign(todo, request.body)
  return todo
})

fastify.delete('/todos/:id', async (request, reply) => {
  const id = Number((request.params as { id: string }).id)
  const idx = todos.findIndex((t) => t.id === id)
  if (idx < 0) return reply.code(404).send({ error: 'not found' })
  todos.splice(idx, 1)
  return reply.code(204).send()
})

fastify.listen({ port: 3000, host: '0.0.0.0' })
`
    }
  ]
}
