import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final_p3: CurriculumStep = {
  id: 'week-2-final-p3',
  title: '1주차 · 연습 ③ 게시판 스키마 설계 — \'sql\' 태그 글 조회 (3중 JOIN)',
  order: 28,
  category: 'advanced',
  content: {
    mission:
      '`schema.sql` 맨 아래에, 태그 이름이 \'sql\' 인 글의 제목과 작성자 이름을 조회하는 쿼리를 작성하세요. `posts` → `post_tags` → `tags` → `users` 순서로 `JOIN` 하고 `WHERE t.name = \'sql\'` 로 거릅니다.',
    theory: `
      ## 복습: 게시판 스키마를 더 단단하게

      - \`CHECK (컬럼 IN ('a', 'b'))\` 로 허용 값 목록을 제한할 수 있습니다.
      - 자주 조회하는 조건 / 정렬 컬럼에는 \`CREATE INDEX 이름 ON 테이블 (컬럼, ...)\` 로 인덱스를 만듭니다.
      - N:M 관계 조회는 조인 테이블을 가운데 두고 JOIN 을 연결합니다:
        \`posts → post_tags → tags\`, 작성자는 \`posts → users\`
    `,
    objectives: [
      'N:M 관계를 JOIN 으로 조회',
      '직전 스텝(게시판 스키마 설계)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '\'sql\' 태그 글 조회 (3중 JOIN) — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `CREATE TABLE users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  status     VARCHAR(20)  NOT NULL DEFAULT 'draft',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  post_id    INT          NOT NULL,
  user_id    INT,
  body       TEXT         NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE tags (
  id   INT         AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /SELECT[^;]*FROM\s+`?posts`?[^;]*JOIN\s+`?post_tags`?[^;]*JOIN\s+`?tags`?[^;]*JOIN\s+`?users`?[^;]*WHERE[^;]*'sql'/i,
        message: 'posts → post_tags → tags → users 를 JOIN 하고 \'sql\' 태그로 거르는 SELECT 가 필요합니다.'
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
      content: '`FROM posts p JOIN post_tags pt ... JOIN tags t ... JOIN users u ...` 순서로 연결하고 `WHERE t.name = \'sql\'` 로 거릅니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts → post_tags → tags → users 를 JOIN 하고 'sql' 태그로 거르는 SELECT 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `SELECT p.title, u.name
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
JOIN tags t       ON t.id = pt.tag_id
JOIN users u      ON u.id = p.user_id
WHERE t.name = 'sql';
`
    }
  ]
}
