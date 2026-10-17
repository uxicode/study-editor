import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p3: CurriculumStep = {
  id: 'week-2-6-p3',
  title: '1주차 · 연습 ③ 기본 쿼리 (INSERT · SELECT · JOIN) — 글이 없는 사용자 찾기',
  order: 24,
  category: 'read',
  content: {
    mission:
      '글을 한 개도 쓰지 않은 사용자를 조회하세요. (`users u LEFT JOIN posts p ... WHERE p.id IS NULL`)',
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
      'LEFT JOIN + IS NULL 로 짝 없는 행 찾기',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '글이 없는 사용자 찾기 — 모든 채점 항목 통과'
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
        pattern: /LEFT\s+JOIN\s+`?posts`?[^;]*WHERE\s+\w+\.id\s+IS\s+NULL/i,
        message: 'LEFT JOIN posts ... WHERE p.id IS NULL 쿼리가 필요합니다.'
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
      content: '`users u LEFT JOIN posts p ON p.user_id = u.id` 후 `WHERE p.id IS NULL` 입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- LEFT JOIN posts ... WHERE p.id IS NULL 쿼리가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `SELECT u.name
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;
`
    }
  ]
}
