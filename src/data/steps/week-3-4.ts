import type { CurriculumStep } from '@/types/curriculum'

export const week_3_4: CurriculumStep = {
  id: 'week-3-4',
  title: '3주차 · 관계 (1:N) include / select',
  order: 16,
  category: 'relations',
  content: {
    mission:
      '`User` 와 `Post` 모델 사이에 1:N 관계를 정의하고, `findMany` 호출에 `include: { posts: true }` 를 사용하여 한 번의 쿼리로 글 목록까지 가져오세요.',
    theory: `
      ## Prisma 의 관계 표현

      \`\`\`prisma
      model User {
        id    Int    @id @default(autoincrement())
        email String @unique
        posts Post[]
      }

      model Post {
        id       Int    @id @default(autoincrement())
        title    String
        author   User   @relation(fields: [authorId], references: [id])
        authorId Int
      }
      \`\`\`

      - 부모: 자식 배열 필드 (\`posts Post[]\`)
      - 자식: \`@relation\` 데코레이터로 FK 컬럼과 참조 컬럼을 명시

      ## include vs select

      \`\`\`ts
      // 자식까지 함께 로드
      await prisma.user.findMany({
        include: { posts: true }
      })

      // 필요한 필드만 선택
      await prisma.user.findMany({
        select: { id: true, email: true, posts: { select: { title: true } } }
      })
      \`\`\`

      ## 왜 중요한가?
      여러 번의 \`findMany\` 호출 (N+1 쿼리) 대신, \`include\` 한 번으로 처리하면 DB 라운드트립이 줄어듭니다.
    `,
    objectives: [
      '@relation 으로 1:N 관계 표현',
      'include 옵션 사용법',
      'select 와의 차이 이해'
    ],
    exercise: `
1. \`schema.prisma\` 에 \`Post\` 모델과 \`User.posts\` 관계 필드를 추가하세요.
2. \`server.ts\` 에서 \`prisma.user.findMany({ include: { posts: true } })\` 를 호출하세요.
    `.trim(),
    expectedOutput: '@relation 인식, include 옵션 사용'
  },
  initialFiles: [
    {
      name: 'schema.prisma',
      path: 'prisma/schema.prisma',
      language: 'prisma',
      content: `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  // TODO: posts Post[] 관계 필드를 추가하세요.
}

// TODO: model Post 를 정의하고 User 와 1:N 관계를 맺으세요.
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: prisma.user.findMany({ include: { posts: true } }) 를 호출하세요.
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /posts\s+Post\[\]/,
        message: 'User 모델에 posts Post[] 관계 필드가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /model\s+Post\s*\{/,
        message: 'model Post 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'prisma/schema.prisma',
        pattern: /@relation\(\s*fields\s*:\s*\[\s*authorId\s*\]\s*,\s*references\s*:\s*\[\s*id\s*\]\s*\)/,
        message: 'Post 에 @relation(fields: [authorId], references: [id]) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /findMany\s*\(\s*\{[\s\S]*include\s*:\s*\{[\s\S]*posts\s*:\s*true/,
        message: 'findMany 에 include: { posts: true } 가 필요합니다.'
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
      content: '부모 모델에는 `자식모델[]` 형태의 필드를 두기만 하면 됩니다. 자식 모델에서 `@relation` 으로 FK 를 명시합니다.'
    },
    {
      level: 2,
      content: 'include 는 객체 형태이며, 키는 관계 필드 이름과 일치해야 합니다.'
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  posts Post[]
}

model Post {
  id       Int    @id @default(autoincrement())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId Int
}

// server.ts
const users = await prisma.user.findMany({
  include: { posts: true }
})
`
    }
  ]
}
