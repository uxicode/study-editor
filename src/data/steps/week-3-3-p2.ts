import type { CurriculumStep } from '@/types/curriculum'

export const week_3_3_p2: CurriculumStep = {
  id: 'week-3-3-p2',
  title: '2주차 · 연습 ② Prisma CRUD — where · contains · orderBy',
  order: 39,
  category: 'create',
  content: {
    mission:
      '`findMany` 에 `where: { name: { contains: \'김\' } }` 와 `orderBy: { createdAt: \'desc\' }` 를 적용해 이름에 \'김\' 이 들어간 사용자를 최신순으로 조회하세요.',
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
      '조건 검색과 정렬 옵션 사용',
      '직전 스텝(Prisma CRUD)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'where · contains · orderBy — 모든 채점 항목 통과'
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
        pattern: /contains\s*:\s*'김'/,
        message: 'where: { name: { contains: \'김\' } } 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /orderBy\s*:\s*\{\s*createdAt\s*:\s*'desc'\s*\}/,
        message: 'orderBy: { createdAt: \'desc\' } 가 필요합니다.'
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
      content: '`where: { name: { contains: \'김\' } }` 와 `orderBy: { createdAt: \'desc\' }` 를 한 객체에 함께 넣습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- where: { name: { contains: '김' } } 가 필요합니다.
- orderBy: { createdAt: 'desc' } 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `const kims = await prisma.user.findMany({
  where: { name: { contains: '김' } },
  orderBy: { createdAt: 'desc' }
})
`
    }
  ]
}
