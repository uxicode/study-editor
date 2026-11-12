import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p2: CurriculumStep = {
  id: 'week-2-6-p2',
  title: '1주차 · 연습 ② 기본 쿼리 (INSERT · SELECT · JOIN) — 우수 작성자 선정',
  order: 23,
  category: 'read',
  content: {
    mission: '글을 3개 이상 쓴 사용자를 글 수가 많은 순서로 조회하세요.',
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
      'GROUP BY 와 HAVING 으로 집계 결과 거르기',
      'WHERE 와 HAVING 의 차이 이해',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
운영팀이 이번 달 "우수 작성자" 에게 배지를 주려고 합니다. 글을 3개 이상 쓴 사용자의 이름과 글 수를, 글이 많은 사람부터 보고 싶어 합니다.

**요구사항**
1. \`queries.sql\` 에 \`users\` 와 \`posts\` 를 연결해 사용자별 글 수를 세는 쿼리를 작성하세요.
2. 결과에는 사용자 이름과 글 수(\`post_count\` 라는 이름)를 보여 줍니다.
3. 글이 3개 이상인 사용자만 남기고, 글 수가 많은 순서로 정렬하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- "글 수 >= 3" 조건을 \`WHERE\` 가 아니라 \`HAVING\` 에 써야 하는 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '우수 작성자 선정 — 모든 채점 항목 통과'
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
        pattern: /JOIN\s+posts/i,
        message: 'users 와 posts 를 연결해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /COUNT\s*\(\s*(?:\w+\.)?id\s*\)\s+(?:AS\s+)?post_count/i,
        message: '글 수를 post_count 라는 이름으로 보여 줘야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /GROUP\s+BY/i,
        message: '사용자별로 묶어야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /HAVING\s+(?:COUNT\s*\(\s*(?:\w+\.)?id\s*\)|post_count)\s*>=\s*3/i,
        message: '글이 3개 이상인 사용자만 남겨야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /ORDER\s+BY\s+(?:post_count|COUNT\s*\(\s*(?:\w+\.)?id\s*\))\s+DESC/i,
        message: '글 수가 많은 순서로 정렬해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /--[^\n]*(?:HAVING|WHERE)/i,
        message: 'WHERE 대신 HAVING 을 쓰는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`GROUP BY` 로 사용자별로 묶은 뒤 집계 결과로 거르는 절은 `HAVING` 입니다. `WHERE` 가 실행되는 시점에 글 수가 이미 계산되어 있는지 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- users 와 posts 를 연결해야 합니다.
- 글 수를 post_count 라는 이름으로 보여 줘야 합니다.
- 사용자별로 묶어야 합니다.
- 글이 3개 이상인 사용자만 남겨야 합니다.
- 글 수가 많은 순서로 정렬해야 합니다.
- WHERE 대신 HAVING 을 쓰는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- WHERE 는 GROUP BY 로 묶기 전에 행 하나하나를 거르므로, 그 시점에는 글 수(COUNT)가 아직 없습니다.
-- HAVING 은 묶고 집계한 뒤에 그룹을 거르므로 "글 수 >= 3" 조건은 HAVING 에 씁니다.
SELECT u.name, COUNT(p.id) AS post_count
FROM users u
JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name
HAVING COUNT(p.id) >= 3
ORDER BY post_count DESC;
`
    }
  ]
}
