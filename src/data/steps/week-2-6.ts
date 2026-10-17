import type { CurriculumStep } from '@/types/curriculum'

export const week_2_6: CurriculumStep = {
  id: 'week-2-6',
  title: '1주차 · 기본 쿼리 (INSERT · SELECT · JOIN)',
  order: 21,
  category: 'read',
  content: {
    mission:
      '`queries.sql` 에 데이터를 넣고 조회하는 쿼리를 작성하세요. `users` / `posts` 에 `INSERT`, 정렬·개수 제한이 있는 `SELECT`, 작성자 정보를 붙이는 `INNER JOIN`, 사용자별 글 수를 세는 `LEFT JOIN + GROUP BY` 를 차례로 작성합니다.',
    theory: `
      스키마(DDL)를 만들었다면, 이제 데이터를 다루는 **DML** 을 익힐 차례입니다. 2주차의 Prisma 메서드도 결국 아래 SQL 로 번역되어 실행됩니다.

      ## INSERT — 데이터 추가

      \`\`\`sql
      INSERT INTO users (email, name) VALUES ('alice@example.com', 'Alice');
      \`\`\`

      - \`AUTO_INCREMENT\` 인 \`id\` 와 \`DEFAULT\` 가 있는 컬럼은 생략할 수 있습니다.

      ## SELECT — 조회 · 필터 · 정렬 · 개수 제한

      \`\`\`sql
      SELECT id, title
      FROM posts
      WHERE user_id = 1
      ORDER BY id DESC
      LIMIT 10 OFFSET 0;
      \`\`\`

      | 절        | 역할                         | Prisma 대응                 |
      |-----------|------------------------------|-----------------------------|
      | WHERE     | 행 필터                       | \`where\`                   |
      | ORDER BY  | 정렬                          | \`orderBy\`                 |
      | LIMIT     | 최대 행 수                    | \`take\`                    |
      | OFFSET    | 건너뛸 행 수                  | \`skip\`                    |

      ## JOIN — 여러 테이블 연결

      \`\`\`sql
      -- INNER JOIN: 양쪽에 짝이 있는 행만
      SELECT p.title, u.name
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id;

      -- LEFT JOIN: 왼쪽(users) 행은 짝이 없어도 모두 포함
      SELECT u.name, COUNT(p.id) AS post_count
      FROM users u
      LEFT JOIN posts p ON p.user_id = u.id
      GROUP BY u.id, u.name;
      \`\`\`

      - \`ON\` 절에는 보통 **FK = PK** 조건을 적습니다.
      - \`LEFT JOIN\` + \`COUNT(p.id)\` 는 글이 없는 사용자도 0 으로 집계합니다 (\`COUNT(*)\` 는 1 이 되므로 주의).

      ## 다음 주 연결
      Prisma 의 \`include\` 는 JOIN 과 같은 결과를 만들고, 3주차의 페이징·EXPLAIN 은 여기서 익힌 \`ORDER BY\` / \`LIMIT\` / \`WHERE\` 를 그대로 사용합니다.
    `,
    objectives: [
      'INSERT 로 부모·자식 테이블에 데이터 추가',
      'WHERE · ORDER BY · LIMIT 로 원하는 행만 조회',
      'INNER JOIN 과 LEFT JOIN 의 차이 이해',
      'GROUP BY + COUNT 로 집계하기'
    ],
    exercise: `
1. \`users\` 에 사용자 2명 이상을 \`INSERT\` 하세요.
2. \`posts\` 에 글을 1개 이상 \`INSERT\` 하세요 (\`user_id\` 는 위에서 넣은 사용자 id).
3. \`posts\` 를 \`ORDER BY\` 로 정렬하고 \`LIMIT\` 으로 개수를 제한해 조회하세요.
4. \`posts\` 와 \`users\` 를 \`INNER JOIN ... ON\` 으로 연결해 글 제목과 작성자 이름을 함께 조회하세요.
5. \`users\` 기준 \`LEFT JOIN\` 과 \`GROUP BY\`, \`COUNT\` 로 사용자별 글 수를 조회하세요.
    `.trim(),
    expectedOutput: 'DML: INSERT ≥ 2, SELECT ≥ 3'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      readonly: true,
      content: `-- 이 스텝에서 사용할 스키마입니다 (읽기 전용).
CREATE TABLE users (
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
      content: `-- TODO 1: 사용자 2명 이상을 추가하세요.

-- TODO 2: 위 사용자가 작성한 글을 1개 이상 추가하세요.

-- TODO 3: 글 목록을 최신순으로 정렬해 최대 10개만 조회하세요.

-- TODO 4: 글 제목과 작성자 이름을 함께 조회하세요 (posts 와 users 연결).

-- TODO 5: 사용자별 글 수를 조회하세요 (글이 없는 사용자도 0 으로 포함).
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /INSERT\s+INTO\s+`?users`?\s*\(/i,
        message: 'users 테이블에 INSERT INTO users (...) VALUES ... 문이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /INSERT\s+INTO\s+`?posts`?\s*\(/i,
        message: 'posts 테이블에 INSERT INTO posts (...) VALUES ... 문이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /SELECT[\s\S]+?FROM\s+`?posts`?[\s\S]*?ORDER\s+BY[\s\S]*?LIMIT\s+\d+/i,
        message: 'posts 를 ORDER BY 로 정렬하고 LIMIT 으로 개수를 제한하는 SELECT 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /INNER\s+JOIN\s+`?users`?[\s\S]*?\bON\b/i,
        message: 'posts 와 users 를 연결하는 INNER JOIN users ... ON ... 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /LEFT\s+(?:OUTER\s+)?JOIN\s+`?posts`?[\s\S]*?\bON\b[\s\S]*?GROUP\s+BY/i,
        message: 'users 기준 LEFT JOIN posts ... ON ... GROUP BY 쿼리가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'queries.sql',
        pattern: /COUNT\s*\(/i,
        message: '사용자별 글 수를 세는 COUNT(...) 가 필요합니다.'
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
      content: '`INSERT INTO 테이블 (컬럼들) VALUES (값들);` 형식이며, 여러 행은 `VALUES (...), (...)` 로 한 번에 넣을 수 있습니다.'
    },
    {
      level: 2,
      content: 'JOIN 은 `FROM posts p INNER JOIN users u ON u.id = p.user_id` 처럼 별칭(alias)을 붙이면 읽기 쉽습니다. 사용자별 집계는 `FROM users` 를 기준으로 `LEFT JOIN posts` 해야 글이 없는 사용자도 포함됩니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `INSERT INTO users (email, name) VALUES
  ('alice@example.com', 'Alice'),
  ('bob@example.com',   'Bob');

INSERT INTO posts (user_id, title, content) VALUES
  (1, '첫 글', '안녕하세요');

SELECT id, title
FROM posts
ORDER BY id DESC
LIMIT 10;

SELECT p.title, u.name
FROM posts p
INNER JOIN users u ON u.id = p.user_id;

SELECT u.name, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
GROUP BY u.id, u.name;
`
    }
  ]
}
