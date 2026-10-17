import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p2: CurriculumStep = {
  id: 'week-2-6-p2',
  title: '1주차 · 연습 ② 기본 쿼리 (INSERT · SELECT · JOIN) — HAVING 으로 그룹 필터',
  order: 23,
  category: 'read',
  content: {
    mission:
      '글을 3개 이상 쓴 사용자만 조회하세요. `LEFT JOIN` + `GROUP BY` 후 `HAVING COUNT(p.id) >= 3` 을 사용하고, `WHERE` 와 `HAVING` 의 차이를 `HAVING` 이라는 단어를 넣어 주석으로 적으세요.',
    theory: `
      ## 복습: SELECT 심화

      \`\`\`sql
      SELECT ... FROM posts WHERE title LIKE '%SQL%' ORDER BY id DESC LIMIT 5;

      SELECT u.name, COUNT(p.id)
      FROM users u LEFT JOIN posts p ON p.user_id = u.id
      GROUP BY u.id, u.name
      HAVING COUNT(p.id) >= 3;
      \`\`\`

      - \`WHERE\` 는 그룹화 전에 행을 거르고, \`HAVING\` 은 그룹화 후에 그룹을 거릅니다.
      - LEFT JOIN 후 \`WHERE 오른쪽.id IS NULL\` 은 "짝이 없는 행" 찾기입니다.
    `,
    objectives: [
      'WHERE 와 HAVING 의 차이 이해',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'HAVING 으로 그룹 필터 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      readonly: true,
      content: `CREATE TABLE users (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL
);

CREATE TABLE posts (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  user_id INT          NOT NULL,
  title   VARCHAR(255) NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`
    },
    {
      name: 'queries.sql',
      path: 'queries.sql',
      language: 'sql',
      content: `-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /GROUP\s+BY[^;]*HAVING\s+COUNT\s*\(\s*(?:\w+\.)?id\s*\)\s*>=\s*3/i,
        message: 'GROUP BY ... HAVING COUNT(p.id) >= 3 쿼리가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /--[^\n]*HAVING/i,
        message: 'WHERE 와 HAVING 의 차이를 -- 주석으로 설명해야 합니다.'
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
      content: '`GROUP BY u.id, u.name` 뒤에 `HAVING COUNT(p.id) >= 3` 을 붙이고, `--` 주석에 HAVING 의 역할을 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- GROUP BY ... HAVING COUNT(p.id) >= 3 쿼리가 필요합니다.
- WHERE 와 HAVING 의 차이를 -- 주석으로 설명해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- WHERE 는 그룹화 전에 행을 거르고, HAVING 은 그룹화(집계) 후에 그룹을 거릅니다.
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(p.id) >= 3;
`
    }
  ]
}
