import type { CurriculumStep } from '@/types/curriculum'

export const week_3_3_p3: CurriculumStep = {
  id: 'week-3-3-p3',
  title: '2주차 · 연습 ③ Prisma CRUD — upsert',
  order: 40,
  category: 'create',
  content: {
    mission:
      '`prisma.user.upsert` 로 "이메일이 있으면 `name` 만 수정, 없으면 새로 생성" 하는 코드를 작성하세요. (`where`, `update`, `create` 세 옵션)',
    theory: `
      ## 복습: Prisma CRUD 메서드

      \`\`\`ts
      await prisma.user.findUnique({ where: { email } })      // 없으면 null
      await prisma.user.findMany({ where: {...}, orderBy: {...} })
      await prisma.user.upsert({ where, update, create })     // 있으면 수정, 없으면 생성
      \`\`\`

      - \`where: { name: { contains: '김' } }\` 는 SQL 의 \`LIKE '%김%'\` 와 같습니다.
      - \`findUnique\` 결과가 \`null\` 일 수 있으니 반드시 처리하세요.
    `,
    objectives: [
      '있으면 수정, 없으면 생성하는 upsert 사용',
      '직전 스텝(Prisma CRUD)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'upsert — 모든 채점 항목 통과'
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

// TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    },
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // TODO: 아래에 이 문제의 풀이를 작성하세요.
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
        target: 'server.ts',
        pattern: /prisma\.user\.upsert\s*\(/,
        message: 'prisma.user.upsert(...) 를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\bupdate\s*:\s*\{/,
        message: 'upsert 에 update: { ... } 옵션이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\bcreate\s*:\s*\{/,
        message: 'upsert 에 create: { ... } 옵션이 필요합니다.'
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
      content: '`prisma.user.upsert({ where, update, create })` 세 옵션이 모두 필요합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma.user.upsert(...) 를 호출해야 합니다.
- upsert 에 update: { ... } 옵션이 필요합니다.
- upsert 에 create: { ... } 옵션이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `await prisma.user.upsert({
  where: { email: 'a@a.com' },
  update: { name: '새 이름' },
  create: { email: 'a@a.com', name: '새 이름' }
})
`
    }
  ]
}
