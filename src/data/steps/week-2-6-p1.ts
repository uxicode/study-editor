import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p1: CurriculumStep = {
  id: 'week-2-6-p1',
  title: '1주차 · 연습 ① 기본 쿼리 (INSERT · SELECT · JOIN) — LIKE 검색과 정렬',
  order: 22,
  category: 'read',
  content: {
    mission:
      '`posts` 에서 `title` 에 \'SQL\' 이 포함된 글만 `WHERE title LIKE \'%SQL%\'` 로 찾고, `ORDER BY id DESC` 로 정렬해 `LIMIT 5` 개만 조회하세요.',
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
      'WHERE LIKE + ORDER BY + LIMIT 조합',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'LIKE 검색과 정렬 — 모든 채점 항목 통과'
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
        pattern: /WHERE\s+title\s+LIKE\s+'%SQL%'[^;]*ORDER\s+BY\s+id\s+DESC[^;]*LIMIT\s+5\b/i,
        message: 'WHERE title LIKE \'%SQL%\' ORDER BY id DESC LIMIT 5 쿼리가 필요합니다.'
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
      content: '`WHERE title LIKE \'%SQL%\'` 다음에 `ORDER BY id DESC LIMIT 5` 를 이어 씁니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- WHERE title LIKE '%SQL%' ORDER BY id DESC LIMIT 5 쿼리가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `SELECT id, title
FROM posts
WHERE title LIKE '%SQL%'
ORDER BY id DESC
LIMIT 5;
`
    }
  ]
}
