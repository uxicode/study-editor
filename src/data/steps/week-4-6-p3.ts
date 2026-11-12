import type { CurriculumStep } from '@/types/curriculum'

export const week_4_6_p3: CurriculumStep = {
  id: 'week-4-6-p3',
  title: '3주차 · 연습 ③ Prisma 쿼리 ↔ SQL 대조 — SQL 을 Prisma 로 옮기기',
  order: 76,
  category: 'read',
  content: {
    mission:
      "이번엔 반대 방향입니다. 주석의 SQL 과 같은 동작을 하는 `prisma.post.findMany(...)` 를 `server.ts` 에 작성하세요. 또한 `new PrismaClient({ log: ['query'] })` 로 쿼리 로그를 켜서, 실제로 나가는 SQL 을 확인할 수 있게 합니다.",
    theory: `
      ## 복습: SQL → Prisma

      | SQL                        | Prisma                         |
      |----------------------------|--------------------------------|
      | \`SELECT id, title\`       | \`select: { id: true, title: true }\` |
      | \`WHERE published = TRUE\` | \`where: { published: true }\` |
      | \`ORDER BY created_at DESC\` | \`orderBy: { createdAt: 'desc' }\` |
      | \`LIMIT 10\`               | \`take: 10\`                   |
      | \`OFFSET 20\`              | \`skip: 20\`                   |

      - SQL 의 컬럼 이름(\`created_at\`)이 아니라 **모델의 필드 이름**(\`createdAt\`)을 씁니다.

      ## 쿼리 로그

      \`\`\`ts
      const prisma = new PrismaClient({ log: ['query'] })
      \`\`\`

      - 개발 환경에서 켜 두면 ORM 이 만든 SQL 을 바로 확인할 수 있습니다.
      - 운영에서는 로그 양이 많으므로 환경 변수로 켜고 끄는 경우가 많습니다.
    `,
    objectives: [
      'SQL 절을 Prisma 쿼리 옵션으로 옮기기',
      "log: ['query'] 로 생성된 SQL 확인하기",
      '직전 스텝(Prisma 쿼리 ↔ SQL 대조)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'SQL 을 Prisma 로 옮기기 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'server.ts',
      path: 'server.ts',
      language: 'typescript',
      content: `import { PrismaClient } from '@prisma/client'

// TODO: 쿼리 로그가 출력되도록 PrismaClient 옵션을 추가하세요.
const prisma = new PrismaClient()

async function main() {
  // 옮길 SQL:
  //   SELECT id, title
  //   FROM posts
  //   WHERE published = TRUE
  //   ORDER BY created_at DESC
  //   LIMIT 10 OFFSET 20;
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
        pattern: /new\s+PrismaClient\s*\(\s*\{[\s\S]*?log\s*:\s*\[[^\]]*['"]query['"]/,
        message: "new PrismaClient({ log: ['query'] }) 로 쿼리 로그를 켜야 합니다."
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /prisma\.post\.findMany\s*\(/,
        message: 'prisma.post.findMany 를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /select\s*:\s*\{(?=[^}]*\bid\s*:\s*true)(?=[^}]*\btitle\s*:\s*true)[^}]*\}/,
        message: 'select: { id: true, title: true } 로 필요한 컬럼만 가져와야 합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /where\s*:\s*\{\s*published\s*:\s*true\s*\}/,
        message: 'where: { published: true } 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /orderBy\s*:\s*\{\s*createdAt\s*:\s*['"]desc['"]\s*\}/,
        message: "orderBy: { createdAt: 'desc' } 가 필요합니다 (컬럼명 created_at 이 아니라 필드명 createdAt)."
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /take\s*:\s*10\b/,
        message: 'LIMIT 10 은 take: 10 입니다.'
      },
      {
        type: 'regex',
        target: 'server.ts',
        pattern: /skip\s*:\s*20\b/,
        message: 'OFFSET 20 은 skip: 20 입니다.'
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
      content: 'SQL 절을 하나씩 옮기세요: SELECT → `select`, WHERE → `where`, ORDER BY → `orderBy`, LIMIT → `take`, OFFSET → `skip`.'
    },
    {
      level: 2,
      content: `채점 항목:
- new PrismaClient({ log: ['query'] }) 로 쿼리 로그를 켜야 합니다.
- prisma.post.findMany 를 호출해야 합니다.
- select: { id: true, title: true } 로 필요한 컬럼만 가져와야 합니다.
- where: { published: true } 가 필요합니다.
- orderBy: { createdAt: 'desc' } 가 필요합니다.
- take: 10, skip: 20 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['query'] })

async function main() {
  const posts = await prisma.post.findMany({
    select: { id: true, title: true },
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
    skip: 20
  })
  console.log(posts)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
    }
  ]
}
