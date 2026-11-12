import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final_p3: CurriculumStep = {
  id: 'week-2-final-p3',
  title: '1주차 · 연습 ③ 게시판 스키마 설계 — 태그 페이지 만들기',
  order: 28,
  category: 'advanced',
  content: {
    mission: '\'sql\' 태그 페이지에 보여 줄 글 제목, 작성자 이름, 작성 시각을 최신순으로 조회하세요.',
    theory: `
      ## 복습: 게시판 스키마를 더 단단하게

      - \`CHECK (컬럼 IN ('a', 'b'))\` 로 허용 값 목록을 제한할 수 있습니다.
      - 자주 조회하는 조건 / 정렬 컬럼에는 \`CREATE INDEX 이름 ON 테이블 (컬럼, ...)\` 로 인덱스를 만듭니다.
      - N:M 관계 조회는 조인 테이블을 가운데 두고 JOIN 을 연결합니다:
        \`posts → post_tags → tags\`, 작성자는 \`posts → users\`
    `,
    objectives: [
      'N:M 조인 테이블을 거치는 다중 JOIN',
      '조인 테이블이 필요한 이유 복습',
      '직전 스텝(게시판 스키마 설계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
태그를 누르면 그 태그가 붙은 글만 모아 보여 주는 "태그 페이지" 를 만듭니다. 화면에는 글 제목, 작성자 이름, 작성 시각이 최신순으로 표시됩니다.

**요구사항**
1. \`schema.sql\` 맨 아래에 이름이 \`'sql'\` 인 태그가 붙은 글을 조회하는 쿼리를 작성하세요.
2. 결과에는 글 제목, 작성자 이름, 작성 시각을 보여 줍니다.
3. 최신 글이 먼저 오도록 정렬하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- \`posts\` 에서 \`tags\` 로 바로 JOIN 할 수 없고 \`post_tags\` 를 거쳐야 하는 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '태그 페이지 만들기 — 모든 채점 항목 통과'
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
        pattern: /JOIN\s+post_tags/i,
        message: 'post_tags 를 거쳐 연결해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /JOIN\s+tags/i,
        message: 'tags 를 연결해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /JOIN\s+users/i,
        message: '작성자 이름을 위해 users 를 연결해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /WHERE\s+(?:\w+\.)?name\s*=\s*'sql'/i,
        message: '이름이 \'sql\' 인 태그만 골라야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /ORDER\s+BY\s+(?:\w+\.)?created_at\s+DESC/i,
        message: '최신 글이 먼저 오도록 정렬해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:post_tags|조인 테이블|N:M|여러|컬럼이 없)/i,
        message: 'post_tags 를 거쳐야 하는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`posts` → `post_tags` → `tags` 순서로 연결하고, 작성자 이름은 `posts.user_id = users.id` 로 연결합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- post_tags 를 거쳐 연결해야 합니다.
- tags 를 연결해야 합니다.
- 작성자 이름을 위해 users 를 연결해야 합니다.
- 이름이 'sql' 인 태그만 골라야 합니다.
- 최신 글이 먼저 오도록 정렬해야 합니다.
- post_tags 를 거쳐야 하는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 글과 태그는 N:M 이라 posts 에는 태그 컬럼이 없고, 둘의 관계는 post_tags 에만 저장되어 있습니다.
SELECT p.title, u.name, p.created_at
FROM posts p
JOIN post_tags pt ON pt.post_id = p.id
JOIN tags t       ON t.id = pt.tag_id
JOIN users u      ON u.id = p.user_id
WHERE t.name = 'sql'
ORDER BY p.created_at DESC;
`
    }
  ]
}
