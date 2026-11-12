import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final_p2: CurriculumStep = {
  id: 'week-2-final-p2',
  title: '1주차 · 연습 ② 게시판 스키마 설계 — 관리자 권한과 "내 글" 목록 속도',
  order: 27,
  category: 'advanced',
  content: {
    mission: '`users.role` 을 두 값으로 제한하고, "내 글" 목록 조회를 빠르게 하는 복합 인덱스를 만드세요.',
    theory: `
      ## 복습: 게시판 스키마를 더 단단하게

      - \`CHECK (컬럼 IN ('a', 'b'))\` 로 허용 값 목록을 제한할 수 있습니다.
      - 자주 조회하는 조건 / 정렬 컬럼에는 \`CREATE INDEX 이름 ON 테이블 (컬럼, ...)\` 로 인덱스를 만듭니다.
      - N:M 관계 조회는 조인 테이블을 가운데 두고 JOIN 을 연결합니다:
        \`posts → post_tags → tags\`, 작성자는 \`posts → users\`
    `,
    objectives: [
      '권한 값 제한',
      '조회 조건에 맞는 복합 인덱스 컬럼 순서 정하기',
      '직전 스텝(게시판 스키마 설계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
마이페이지의 "내 글" 목록은 \`WHERE user_id = ?\` 로 내 글만 고른 뒤 \`ORDER BY created_at DESC\` 로 최신순 정렬합니다. 글이 많아지자 이 화면이 느려졌습니다. 또 권한 컬럼에 \`'superuser'\` 같은 알 수 없는 값이 들어가 권한 검사가 꼬인 적이 있습니다.

**요구사항**
1. 아래 스키마의 \`users\` 정의를 고쳐, \`role\` 에 \`'user'\` 와 \`'admin'\` 만 저장되도록 하세요.
2. 스키마 맨 아래에 "내 글" 목록 조회를 빠르게 하는 \`posts\` 의 복합 인덱스 \`idx_posts_user_created\` 를 만드세요.

**생각해 보기** (\`--\` 주석으로 작성)
- 인덱스의 컬럼 순서를 \`(created_at, user_id)\` 가 아니라 \`(user_id, created_at)\` 로 정한 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '관리자 권한과 "내 글" 목록 속도 — 모든 채점 항목 통과'
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
        pattern: /role\s+VARCHAR\s*\(\s*\d+\s*\)[^,\n]*CHECK\s*\(\s*role\s+IN\s*\(\s*(?:'user'\s*,\s*'admin'|'admin'\s*,\s*'user')\s*\)\s*\)/i,
        message: 'role 에 \'user\', \'admin\' 만 허용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+INDEX\s+idx_posts_user_created\s+ON\s+posts\s*\(\s*user_id\s*,\s*created_at(?:\s+DESC)?\s*\)/i,
        message: '"내 글" 목록 조회에 맞는 복합 인덱스 idx_posts_user_created 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:user_id|먼저|순서|WHERE|정렬)/i,
        message: '인덱스 컬럼 순서를 정한 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '복합 인덱스는 앞 컬럼부터 차례로 정렬되어 있습니다. 먼저 `user_id` 로 내 글 범위를 좁히고, 그 안에서 `created_at` 순서를 그대로 쓰는 모습을 떠올려 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- role 에 'user', 'admin' 만 허용해야 합니다.
- "내 글" 목록 조회에 맞는 복합 인덱스 idx_posts_user_created 가 필요합니다.
- 인덱스 컬럼 순서를 정한 이유를 -- 주석으로 서술해야 합니다.`
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

-- 조회가 먼저 WHERE user_id = ? 로 범위를 좁히므로 user_id 가 앞에 와야 하고,
-- 그 안에서 created_at 순서가 이미 정렬되어 있어 ORDER BY 를 추가 정렬 없이 처리할 수 있습니다.
CREATE INDEX idx_posts_user_created ON posts (user_id, created_at);
`
    }
  ]
}
