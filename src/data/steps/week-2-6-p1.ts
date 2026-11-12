import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6_p1: CurriculumStep = {
  id: 'week-2-6-p1',
  title: '1주차 · 연습 ① 기본 쿼리 (INSERT · SELECT · JOIN) — 검색 결과 첫 페이지',
  order: 22,
  category: 'read',
  content: {
    mission: '검색창에 "SQL" 을 입력했을 때 보여 줄 검색 결과 첫 페이지를 조회하세요.',
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
      'LIKE 로 부분 일치 검색',
      'ORDER BY · LIMIT · OFFSET 으로 페이지 나누기',
      '직전 스텝(기본 쿼리 (INSERT · SELECT · JOIN))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
게시판 검색 기능을 만듭니다. 검색 결과는 한 페이지에 5개씩, 최신 글이 위에 오도록 보여 줍니다. (\`posts\` 에는 작성 시각 컬럼이 없으므로 \`id\` 가 클수록 최신 글입니다.)

**요구사항**
1. \`queries.sql\` 에 제목에 \`SQL\` 이 포함된 글을 찾는 쿼리를 작성하세요.
2. 결과에는 글 번호(\`id\`)와 제목(\`title\`)만 보여 줍니다.
3. 최신 글이 먼저 오도록 정렬하고, 첫 페이지인 5개만 가져오세요.

**생각해 보기** (\`--\` 주석으로 작성)
- 사용자가 "2페이지" (6~10번째 결과)를 누르면 쿼리를 어떻게 바꾸면 되는지 서술해 주세요.
    `.trim(),
    expectedOutput: '검색 결과 첫 페이지 — 모든 채점 항목 통과'
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
        pattern: /SELECT\s+(?:\w+\.)?id\s*,\s*(?:\w+\.)?title\s+FROM\s+posts/i,
        message: '글 번호와 제목만 조회해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /WHERE\s+(?:\w+\.)?title\s+LIKE\s+'%SQL%'/i,
        message: '제목에 SQL 이 포함된 글을 찾아야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /ORDER\s+BY\s+(?:\w+\.)?id\s+DESC/i,
        message: '최신 글이 먼저 오도록 정렬해야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /LIMIT\s+5\b/i,
        message: '첫 페이지인 5개만 가져와야 합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /--[^\n]*(?:OFFSET|LIMIT\s*5\s*,)/i,
        message: '2페이지 조회 방법을 -- 주석으로 서술해야 합니다.'
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
      content: '부분 일치는 `LIKE \'%단어%\'`, 최신순은 `ORDER BY id DESC`, 개수 제한은 `LIMIT` 입니다. 앞의 결과를 건너뛰는 절이 무엇이었는지 이론 표를 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- 글 번호와 제목만 조회해야 합니다.
- 제목에 SQL 이 포함된 글을 찾아야 합니다.
- 최신 글이 먼저 오도록 정렬해야 합니다.
- 첫 페이지인 5개만 가져와야 합니다.
- 2페이지 조회 방법을 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 2페이지는 앞의 5개를 건너뛰면 되므로 LIMIT 5 OFFSET 5 로 바꿉니다.
SELECT id, title
FROM posts
WHERE title LIKE '%SQL%'
ORDER BY id DESC
LIMIT 5;
`
    }
  ]
}
