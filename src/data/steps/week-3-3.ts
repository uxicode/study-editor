import type { CurriculumStep } from '@/types/curriculum'

export const week_3_3: CurriculumStep = {
  id: 'week-3-3',
  title: '3주차 · Prisma CRUD',
  order: 15,
  category: 'create',
  content: {
    mission:
      '`server.ts` 에서 Prisma Client 를 만들고 `create`, `findMany`, `update`, `delete` 네 가지 메서드를 모두 호출하여 기본 CRUD 흐름을 작성하세요.',
    theory: `
      ## Prisma 클라이언트

      \`\`\`ts
      import { PrismaClient } from '@prisma/client'
      const prisma = new PrismaClient()
      \`\`\`

      ## 핵심 메서드 4가지

      \`\`\`ts
      // CREATE
      const user = await prisma.user.create({
        data: { email: 'alice@example.com', name: 'Alice' }
      })

      // READ
      const users = await prisma.user.findMany()

      // UPDATE
      await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Alicia' }
      })

      // DELETE
      await prisma.user.delete({ where: { id: user.id } })
      \`\`\`

      ## 안전한 종료

      \`prisma.$disconnect()\` 를 \`finally\` 블록에서 호출하여 커넥션 풀을 정리합니다.
    `,
    objectives: [
      'Prisma 의 4가지 CRUD 메서드 사용',
      'where / data 옵션 차이 이해',
      'await 와 비동기 흐름 다루기'
    ],
    exercise: `
1. \`server.ts\` 에서 \`PrismaClient\` 를 import 하고 인스턴스를 만드세요.
2. main() 함수 내에서 \`prisma.user.create\`, \`prisma.user.findMany\`, \`prisma.user.update\`, \`prisma.user.delete\` 를 순차적으로 호출하세요.
3. \`main().finally(() => prisma.$disconnect())\` 로 종료 처리하세요.
    `.trim(),
    expectedOutput: '.create() 호출 발견, .findMany() 호출 발견, .update() 호출 발견, .delete() 호출 발견'
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
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: prisma.user.create({ data: ... })
  // TODO: prisma.user.findMany()
  // TODO: prisma.user.update({ where, data })
  // TODO: prisma.user.delete({ where })
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
        type: 'includes',
        target: 'server.ts',
        pattern: '@prisma/client',
        message: 'Prisma Client 를 import 해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.create\s*\(/,
        message: 'prisma.user.create() 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.findMany\s*\(/,
        message: 'prisma.user.findMany() 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.update\s*\(/,
        message: 'prisma.user.update() 호출이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.user\.delete\s*\(/,
        message: 'prisma.user.delete() 호출이 필요합니다.'
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
      content: '`create` 에는 `data`, `update` / `delete` 에는 `where` 가 필수입니다.'
    },
    {
      level: 2,
      content: 'await 를 사용하려면 함수가 async 여야 합니다. main 은 이미 async 로 선언되어 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: { email: 'alice@example.com', name: 'Alice' }
  })
  console.log('created', user)

  const users = await prisma.user.findMany()
  console.log('all', users)

  await prisma.user.update({
    where: { id: user.id },
    data: { name: 'Alicia' }
  })

  await prisma.user.delete({ where: { id: user.id } })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
