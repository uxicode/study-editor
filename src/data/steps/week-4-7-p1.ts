import type { CurriculumStep } from '@/types/curriculum'

export const week_4_7_p1: CurriculumStep = {
  id: 'week-4-7-p1',
  title: '3주차 · 연습 ① Raw SQL ($queryRaw) — $executeRaw 로 대량 UPDATE',
  order: 78,
  category: 'update',
  content: {
    mission:
      '`publishAllByUser(userId)` 를 `prisma.$executeRaw` 태그드 템플릿으로 구현하세요. 해당 사용자의 글을 모두 `published = TRUE` 로 바꾸는 `UPDATE posts ... WHERE user_id = ${userId}` 를 실행하고, 반환값(바뀐 행 수)을 그대로 돌려줍니다.',
    theory: `
      ## 복습: Raw SQL

      \`\`\`ts
      const rows = await prisma.$queryRaw<Row[]>\`SELECT ... WHERE id = \${id}\`
      \`\`\`

      - 태그드 템플릿의 \`\${...}\` 는 바인딩 값으로 전달되어 SQL 인젝션에 안전합니다.

      ## $queryRaw vs $executeRaw

      | 메서드          | 용도                     | 반환값              |
      |-----------------|--------------------------|---------------------|
      | \`$queryRaw\`   | SELECT (행을 돌려받음)   | 결과 행 배열        |
      | \`$executeRaw\` | INSERT / UPDATE / DELETE | **영향받은 행 수** (number) |

      \`\`\`ts
      const count = await prisma.$executeRaw\`
        UPDATE posts SET published = TRUE WHERE user_id = \${userId}
      \`
      \`\`\`

      - Prisma 의 \`updateMany\` 로도 같은 일을 할 수 있지만, \`SET views = views + 1\` 같은 계산식, 다른 테이블을 참조하는 UPDATE 등은 Raw SQL 이 더 간단합니다.
    `,
    objectives: [
      '$executeRaw 의 용도와 반환값 이해',
      '직전 스텝(Raw SQL ($queryRaw))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '$executeRaw 로 대량 UPDATE — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 참고: 테이블은 posts(id, user_id, title, published, ...) 입니다.

async function publishAllByUser(userId: number): Promise<number> {
  // TODO: 아래에 이 문제의 풀이를 작성하세요.
  return 0
}

async function main() {
  console.log(await publishAllByUser(1))
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
        pattern: /prisma\.\$executeRaw\s*`/,
        message: 'prisma.$executeRaw`...` 태그드 템플릿을 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\$executeRaw\s*`[^`]*UPDATE\s+posts\s+SET\s+published\s*=\s*(TRUE|1)\b[^`]*`/i,
        message: 'UPDATE posts SET published = TRUE 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /\$executeRaw\s*`[^`]*WHERE\s+user_id\s*=\s*\$\{\s*userId\s*\}[^`]*`/i,
        message: 'WHERE user_id = ${userId} 처럼 userId 를 바인딩해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /return\s+(await\s+prisma\.\$executeRaw|count\b|updated\b|affected\b|result\b)/,
        message: '$executeRaw 가 돌려준 바뀐 행 수를 반환해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /^(?![\s\S]*\$executeRawUnsafe)/,
        message: '$executeRawUnsafe 는 SQL 인젝션 위험이 있으니 $executeRaw 를 사용하세요.'
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
      content: '`prisma.$executeRaw` 뒤에 괄호 없이 백틱으로 UPDATE 문을 쓰고, 결과(바뀐 행 수)를 `count` 에 담아 반환합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- prisma.$executeRaw\`...\` 태그드 템플릿을 사용해야 합니다.
- UPDATE posts SET published = TRUE 가 필요합니다.
- WHERE user_id = \${userId} 처럼 userId 를 바인딩해야 합니다.
- $executeRaw 가 돌려준 바뀐 행 수를 반환해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function publishAllByUser(userId: number): Promise<number> {
  const count = await prisma.$executeRaw\`
    UPDATE posts SET published = TRUE WHERE user_id = \${userId}
  \`
  return count
}

async function main() {
  console.log(await publishAllByUser(1))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
