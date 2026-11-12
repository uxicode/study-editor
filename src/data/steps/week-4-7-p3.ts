import type { CurriculumStep } from '@/types/curriculum'

export const week_4_7_p3: CurriculumStep = {
  id: 'week-4-7-p3',
  title: '3주차 · 연습 ③ Raw SQL ($queryRaw) — IN 목록은 Prisma.join',
  order: 80,
  category: 'read',
  content: {
    mission:
      '`findUsersByIds(ids)` 를 `$queryRaw` 로 구현하세요. `WHERE id IN (${ids})` 처럼 배열을 그대로 넣으면 안 되고, `Prisma.join(ids)` 로 값마다 바인딩 자리를 만들어야 합니다. `Prisma` 는 `@prisma/client` 에서 import 합니다.',
    theory: `
      ## 복습: $queryRaw 바인딩

      \`\`\`ts
      await prisma.$queryRaw\`SELECT * FROM users WHERE id = \${id}\`
      \`\`\`

      ## 배열을 IN 에 넣기

      \`\`\`ts
      import { Prisma, PrismaClient } from '@prisma/client'

      const ids = [1, 2, 3]
      await prisma.$queryRaw\`
        SELECT * FROM users WHERE id IN (\${Prisma.join(ids)})
      \`
      // 전송: SELECT * FROM users WHERE id IN (?, ?, ?)
      \`\`\`

      - \`Prisma.join(배열)\` 은 값마다 \`?\` 를 만들어 쉼표로 이어 줍니다.
      - 빈 배열이면 \`IN ()\` 이 되어 SQL 문법 오류가 나므로, 미리 \`if (ids.length === 0) return []\` 로 막습니다.

      ## 동적 SQL 조각 도구

      | 헬퍼               | 용도                                  |
      |--------------------|---------------------------------------|
      | \`Prisma.sql\`     | 바인딩이 유지되는 SQL 조각 만들기     |
      | \`Prisma.join\`    | 값 목록을 \`?, ?, ?\` 로 펼치기       |
      | \`Prisma.empty\`   | 조건이 없을 때 넣는 빈 조각           |
      | \`Prisma.raw\`     | 바인딩 없이 그대로 삽입 (**사용자 입력 금지**) |
    `,
    objectives: [
      'Prisma.join 으로 IN 목록을 안전하게 바인딩',
      '빈 배열 예외 처리',
      '직전 스텝(Raw SQL ($queryRaw))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'IN 목록은 Prisma.join — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 참고: 테이블은 users(id, email, name) 입니다.
type UserRow = { id: number; email: string; name: string }

// TODO: Prisma 를 import 하고, findUsersByIds(ids: number[]) 를 구현하세요.
//       빈 배열이면 쿼리 없이 [] 를 반환합니다.

async function main() {
  // TODO: findUsersByIds([1, 2, 3]) 의 결과를 출력하세요.
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
        pattern: /import\s*\{[^}]*\bPrisma\b[^}]*\}\s*from\s*['"]@prisma\/client['"]/,
        message: "import { Prisma, PrismaClient } from '@prisma/client' 처럼 Prisma 를 import 해야 합니다."
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /async\s+function\s+findUsersByIds\s*\(\s*ids\s*:\s*number\[\]\s*\)/,
        message: 'findUsersByIds(ids: number[]) 함수가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /ids\.length\s*===\s*0/,
        message: '빈 배열이면 IN () 문법 오류가 나므로 ids.length === 0 일 때 먼저 반환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.\$queryRaw\s*(<[^>]*>)?\s*`[^`]*IN\s*\(\s*\$\{\s*Prisma\.join\s*\(\s*ids\s*\)\s*\}\s*\)[^`]*`/i,
        message: '$queryRaw`... WHERE id IN (${Prisma.join(ids)})` 형태로 바인딩해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /^(?![\s\S]*(\$queryRawUnsafe|Prisma\.raw))/,
        message: '$queryRawUnsafe / Prisma.raw 는 바인딩되지 않으니 사용하지 마세요.'
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
      content: '`import { Prisma, PrismaClient } from \'@prisma/client\'` 로 바꾸고, IN 괄호 안에 `${Prisma.join(ids)}` 를 넣습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- Prisma 를 import 해야 합니다.
- findUsersByIds(ids: number[]) 함수가 필요합니다.
- ids.length === 0 일 때 먼저 반환해야 합니다.
- $queryRaw\`... WHERE id IN (\${Prisma.join(ids)})\` 형태로 바인딩해야 합니다.
- $queryRawUnsafe / Prisma.raw 는 사용하지 마세요.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type UserRow = { id: number; email: string; name: string }

async function findUsersByIds(ids: number[]): Promise<UserRow[]> {
  if (ids.length === 0) return []

  return prisma.$queryRaw<UserRow[]>\`
    SELECT id, email, name FROM users WHERE id IN (\${Prisma.join(ids)})
  \`
}

async function main() {
  console.log(await findUsersByIds([1, 2, 3]))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
