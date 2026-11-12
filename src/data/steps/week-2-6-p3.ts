import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p3: CurriculumStep = {
  id: 'week-2-6-p3',
  title: '1주차 · 연습 ③ 기본 쿼리 (INSERT · SELECT · JOIN) — 아직 글을 안 쓴 회원에게 안내 메일',
  order: 24,
  category: 'read',
  content: {
    mission: '가입 후 글을 한 개도 쓰지 않은 회원의 이름과 이메일을 조회하세요.',
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
      'LEFT JOIN 과 IS NULL 로 "없는 것" 찾기',
      'INNER JOIN 과 LEFT JOIN 의 차이 이해',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
마케팅팀이 "첫 글 작성 이벤트" 안내 메일을 보내려고 합니다. 대상은 가입은 했지만 아직 글을 하나도 쓰지 않은 회원입니다.

**요구사항**
1. \`queries.sql\` 에 글을 한 개도 쓰지 않은 회원을 찾는 쿼리를 작성하세요.
2. 결과에는 메일 발송에 필요한 이름(\`name\`)과 이메일(\`email\`)을 보여 줍니다.
3. \`users\` 를 기준으로 \`posts\` 를 연결하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- 이 쿼리를 \`INNER JOIN\` 으로 쓰면 원하는 회원을 찾을 수 없는 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '아직 글을 안 쓴 회원에게 안내 메일 — 모든 채점 항목 통과'
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
        pattern: /SELECT\s+(?:\w+\.)?(?:name\s*,\s*(?:\w+\.)?email|email\s*,\s*(?:\w+\.)?name)\s+FROM\s+users/i,
        message: 'users 에서 이름과 이메일을 조회해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /LEFT\s+(?:OUTER\s+)?JOIN\s+posts/i,
        message: 'users 를 기준으로 posts 를 연결해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /WHERE\s+(?:\w+\.)?id\s+IS\s+NULL/i,
        message: '글이 연결되지 않은 회원만 남겨야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /--[^\n]*(?:INNER)/i,
        message: 'INNER JOIN 으로는 찾을 수 없는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`LEFT JOIN` 은 짝이 없는 왼쪽 행도 남기고 오른쪽 컬럼을 `NULL` 로 채웁니다. 그 `NULL` 을 조건으로 쓰면 "글이 없는 회원" 만 남길 수 있습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- users 에서 이름과 이메일을 조회해야 합니다.
- users 를 기준으로 posts 를 연결해야 합니다.
- 글이 연결되지 않은 회원만 남겨야 합니다.
- INNER JOIN 으로는 찾을 수 없는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- INNER JOIN 은 양쪽에 짝이 있는 행만 남기므로, 글이 없는 회원은 결과에서 아예 빠집니다.
SELECT u.name, u.email
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE p.id IS NULL;
`
    }
  ]
}
