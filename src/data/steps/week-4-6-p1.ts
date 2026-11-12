import type { CurriculumStep } from '@/types/curriculum'

export const week_4_6_p1: CurriculumStep = {
  id: 'week-4-6-p1',
  title: '3주차 · 연습 ① Prisma 쿼리 ↔ SQL 대조 — include 가 보내는 쿼리',
  order: 74,
  category: 'relations',
  content: {
    mission:
      '`include: { posts: true }` 는 JOIN 이 아니라 **쿼리 두 개**로 실행됩니다. 주석의 Prisma 호출이 보내는 두 `SELECT` 를 순서대로 작성하고, 몇 번의 쿼리가 나가는지 `--` 주석으로 적으세요 (예: `-- 쿼리 2번`).',
    theory: `
      ## 복습: Prisma ↔ SQL

      | Prisma                          | SQL                     |
      |---------------------------------|-------------------------|
      | \`where: { id: { in: [1, 2] } }\` | \`WHERE id IN (1, 2)\` |
      | \`include: { posts: true }\`    | 자식 테이블을 **별도 쿼리**로 조회 |

      ## include 의 실제 동작

      \`\`\`ts
      await prisma.user.findMany({ include: { posts: true } })
      \`\`\`

      \`\`\`sql
      -- 1) 부모 조회
      SELECT * FROM users;
      -- 2) 1번 결과의 id 들로 자식 조회
      SELECT * FROM posts WHERE user_id IN (1, 2, 3);
      \`\`\`

      - Prisma 는 두 결과를 메모리에서 합쳐 \`user.posts\` 배열을 만들어 줍니다.
      - 사용자 수와 관계없이 쿼리는 2번입니다. N+1 (사용자마다 1번씩) 보다 훨씬 적습니다.
      - Prisma 5.8 에서 도입된 \`relationLoadStrategy: 'join'\` 옵션으로 JOIN 한 번에 가져오게 바꿀 수도 있습니다 (버전에 따라 프리뷰 기능 \`relationJoins\` 를 켜야 합니다).
    `,
    objectives: [
      'include 가 JOIN 이 아닌 IN 쿼리 두 개로 실행됨을 이해',
      '직전 스텝(Prisma 쿼리 ↔ SQL 대조)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'include 가 보내는 쿼리 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'queries.sql',
      path: 'queries.sql',
      language: 'sql',
      content: `-- 참고: users(id, email, name, role), posts(id, user_id, title, published, created_at) 테이블이 있다고 가정합니다.

-- prisma.user.findMany({
--   where: { id: { in: [1, 2] } },
--   include: { posts: true }
-- })

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*FROM\s+users\s+WHERE\s+id\s+IN\s*\(\s*1\s*,\s*2\s*\)/im,
        message: '1) users 에서 id IN (1, 2) 인 사용자를 조회하는 SELECT 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*FROM\s+posts\s+WHERE\s+user_id\s+IN\s*\(\s*1\s*,\s*2\s*\)/im,
        message: '2) posts 에서 user_id IN (1, 2) 인 글을 조회하는 SELECT 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /--[^\n]*2\s*(번|개)/,
        message: 'Prisma 가 보내는 쿼리 개수(2번)를 -- 주석으로 적어야 합니다.'
      }
    ],
    dynamicChecks: [
      {
        type: 'result',
        test: (result: unknown) => Boolean((result as { success?: boolean }).success),
        message: 'SQL 이 정상적으로 분석되어야 합니다.'
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '먼저 부모(`users`)를 `WHERE id IN (1, 2)` 로 조회하고, 그 id 들로 자식(`posts`)을 `WHERE user_id IN (1, 2)` 로 조회합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- 1) users 에서 id IN (1, 2) 인 사용자를 조회하는 SELECT 가 필요합니다.
- 2) posts 에서 user_id IN (1, 2) 인 글을 조회하는 SELECT 가 필요합니다.
- Prisma 가 보내는 쿼리 개수(2번)를 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- include 는 JOIN 이 아니라 쿼리 2번으로 실행된다.

-- 1) 부모 조회
SELECT * FROM users WHERE id IN (1, 2);

-- 2) 1번 결과의 id 로 자식 조회
SELECT * FROM posts WHERE user_id IN (1, 2);
`
    }
  ]
}
