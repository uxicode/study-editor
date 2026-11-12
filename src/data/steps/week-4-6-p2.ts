import type { CurriculumStep } from '@/types/curriculum'

export const week_4_6_p2: CurriculumStep = {
  id: 'week-4-6-p2',
  title: '3주차 · 연습 ② Prisma 쿼리 ↔ SQL 대조 — groupBy 를 GROUP BY 로',
  order: 75,
  category: 'read',
  content: {
    mission:
      '주석의 `prisma.post.groupBy(...)` 와 같은 결과를 내는 SELECT 를 작성하세요. 공개된(`published`) 글만 대상으로 사용자별 글 수를 세고, 개수 컬럼의 별칭은 `post_count`, `user_id` 오름차순으로 정렬합니다.',
    theory: `
      ## 복습: Prisma ↔ SQL

      | Prisma                       | SQL                    |
      |------------------------------|------------------------|
      | \`where: { published: true }\` | \`WHERE published = TRUE\` |
      | \`orderBy: { userId: 'asc' }\` | \`ORDER BY user_id ASC\` |

      ## groupBy · 집계

      \`\`\`ts
      await prisma.post.groupBy({
        by: ['userId'],
        _count: { _all: true }
      })
      // [{ userId: 1, _count: { _all: 3 } }, ...]
      \`\`\`

      \`\`\`sql
      SELECT user_id, COUNT(*) AS post_count
      FROM posts
      GROUP BY user_id;
      \`\`\`

      - \`by\` → \`GROUP BY\`, \`_count\` → \`COUNT(*)\`, \`_sum\` / \`_avg\` → \`SUM\` / \`AVG\`
      - 필드 이름은 모델 기준(\`userId\`)이지만 SQL 에서는 \`@map\` 된 컬럼 이름(\`user_id\`)을 씁니다.
    `,
    objectives: [
      'groupBy · _count 가 GROUP BY · COUNT 로 바뀌는 방식 이해',
      '직전 스텝(Prisma 쿼리 ↔ SQL 대조)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'groupBy 를 GROUP BY 로 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'queries.sql',
      path: 'queries.sql',
      language: 'sql',
      content: `-- 참고: users(id, email, name, role), posts(id, user_id, title, published, created_at) 테이블이 있다고 가정합니다.

-- prisma.post.groupBy({
--   by: ['userId'],
--   where: { published: true },
--   _count: { _all: true },
--   orderBy: { userId: 'asc' }
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
        pattern: /^\s*SELECT[\s\S]*COUNT\s*\([^)]*\)\s+AS\s+post_count[\s\S]*FROM\s+posts/im,
        message: 'posts 에서 COUNT(*) AS post_count 로 글 수를 세는 SELECT 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*WHERE\s+published\s*=\s*(TRUE|1)\b/im,
        message: '공개된 글만 세도록 WHERE published = TRUE 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /^\s*SELECT[\s\S]*GROUP\s+BY\s+user_id[\s\S]*ORDER\s+BY\s+user_id/im,
        message: 'GROUP BY user_id 와 ORDER BY user_id 가 필요합니다.'
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
      content: '`by` 는 `GROUP BY`, `_count` 는 `COUNT(*)`, `where` 는 그룹을 만들기 전에 거르는 `WHERE` 입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts 에서 COUNT(*) AS post_count 로 글 수를 세는 SELECT 가 필요합니다.
- 공개된 글만 세도록 WHERE published = TRUE 가 필요합니다.
- GROUP BY user_id 와 ORDER BY user_id 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `SELECT user_id, COUNT(*) AS post_count
FROM posts
WHERE published = TRUE
GROUP BY user_id
ORDER BY user_id ASC;
`
    }
  ]
}
