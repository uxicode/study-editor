import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final_p2: CurriculumStep = {
  id: 'week-2-final-p2',
  title: '1주차 · 연습 ② 게시판 스키마 설계 — role 제한과 복합 인덱스',
  order: 27,
  category: 'advanced',
  content: {
    mission:
      '`users.role` 에 `CHECK (role IN (\'user\', \'admin\'))` 를 추가하고, 자주 조회하는 `posts(user_id, created_at)` 에 `CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);` 인덱스를 만드세요.',
    theory: `
      ## 복습: 게시판 스키마를 더 단단하게

      - \`CHECK (컬럼 IN ('a', 'b'))\` 로 허용 값 목록을 제한할 수 있습니다.
      - 자주 조회하는 조건 / 정렬 컬럼에는 \`CREATE INDEX 이름 ON 테이블 (컬럼, ...)\` 로 인덱스를 만듭니다.
      - N:M 관계 조회는 조인 테이블을 가운데 두고 JOIN 을 연결합니다:
        \`posts → post_tags → tags\`, 작성자는 \`posts → users\`
    `,
    objectives: [
      'CHECK IN 과 CREATE INDEX 적용',
      '직전 스텝(게시판 스키마 설계)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'role 제한과 복합 인덱스 — 모든 채점 항목 통과'
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
        pattern: /\brole\s+VARCHAR\s*\(\s*20\s*\)[^;]*?CHECK\s*\(\s*role\s+IN\s*\(\s*'user'\s*,\s*'admin'\s*\)\s*\)/i,
        message: 'users.role 에 CHECK (role IN (\'user\', \'admin\')) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+INDEX\s+\w+\s+ON\s+`?posts`?\s*\(\s*user_id\s*,\s*created_at\s*\)/i,
        message: 'CREATE INDEX ... ON posts (user_id, created_at) 가 필요합니다.'
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
      content: '`role` 정의에 `CHECK (role IN (\'user\', \'admin\'))` 를 붙이고, 별도 문장으로 `CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);` 를 작성하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- users.role 에 CHECK (role IN ('user', 'admin')) 가 필요합니다.
- CREATE INDEX ... ON posts (user_id, created_at) 가 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(100) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);
`
    }
  ]
}
