import type { CurriculumStep } from '@/types/curriculum'

export const week_3_3_p1: CurriculumStep = {
  id: 'week-3-3-p1',
  title: '2주차 · 연습 ① Prisma CRUD — findUnique 와 null 처리',
  order: 38,
  category: 'create',
  content: {
    mission:
      '`prisma.user.findUnique({ where: { email } })` 로 이메일 하나를 조회하고, 결과가 `null` 이면(`if (found === null)` 또는 `if (!found)`) "사용자 없음" 을 출력하세요.',
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
      '고유 값으로 조회하고 null 처리하기',
      '직전 스텝(Prisma CRUD)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'findUnique 와 null 처리 — 모든 채점 항목 통과'
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
        pattern: /prisma\.user\.findUnique\s*\(\s*\{\s*where\s*:\s*\{\s*email/,
        message: 'prisma.user.findUnique({ where: { email ... } }) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /if\s*\(\s*(?:!\s*\w+|\w+\s*===?\s*null)\s*\)/,
        message: '결과가 null 인 경우를 if 로 처리해야 합니다.'
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
      content: '`const found = await prisma.user.findUnique({ where: { email: ... } })` 후 `if (found === null)` 로 분기합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma.user.findUnique({ where: { email ... } }) 가 필요합니다.
- 결과가 null 인 경우를 if 로 처리해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `const found = await prisma.user.findUnique({ where: { email: 'a@a.com' } })
if (found === null) console.log('사용자 없음')
`
    }
  ]
}
