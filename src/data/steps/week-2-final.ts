import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final: CurriculumStep = {
  id: 'week-2-final',
  title: '1주차 종합 · 게시판 스키마 설계',
  order: 25,
  category: 'advanced',
  content: {
    mission:
      '간단한 블로그/게시판 스키마를 한 파일에 완성하세요. `users`, `posts`, `comments`, `tags`, `post_tags` 5개 테이블과 그 사이의 모든 외래키 / 복합 PK / 핵심 제약을 포함합니다.',
    theory: `
      이 종합 과제는 이번 주(1주차)에 다룬 모든 개념을 합칩니다.

      ## 데이터 모델 요약

      - \`users\` — 사용자
      - \`posts\` — 글, 작성자는 \`users\` 의 1:N
      - \`comments\` — 댓글, \`posts\` 와 \`users\` 의 각각 N:1
      - \`tags\` — 태그
      - \`post_tags\` — \`posts × tags\` N:M 조인 테이블

      ## 설계 포인트

      1. 모든 PK 는 \`AUTO_INCREMENT\` 정수, 또는 복합 PK
      2. 이메일은 \`UNIQUE NOT NULL\`
      3. 자식 테이블의 FK 는 부모 삭제 시 어떻게 다룰지 (\`CASCADE\` / \`SET NULL\`) 명시
      4. 기본값 / 제약을 적절히 활용 (예: \`status\` 컬럼 \`DEFAULT 'draft'\`)

      ## 다음 주 연결
      이 스키마는 2주차의 Prisma 모델, 3주차의 인덱스 / 트랜잭션 / 페이징 예제에서 계속 활용됩니다.
    `,
    objectives: [
      '한 SQL 파일 안에서 일관된 스키마 설계',
      '여러 관계(1:N·N:M)를 한 번에 표현',
      '실무에서 자주 쓰는 제약·기본값 조합 적용'
    ],
    exercise: `
1. \`users\`, \`posts\`, \`comments\`, \`tags\`, \`post_tags\` 5개 테이블을 모두 정의하세요.
2. FK 가 최소 3개 이상 등장해야 합니다 (\`posts.user_id\`, \`comments.post_id\`, \`comments.user_id\`, \`post_tags.post_id\`, \`post_tags.tag_id\` 중 3 이상).
3. \`post_tags\` 의 PK 는 \`(post_id, tag_id)\` 복합 PK 로 유지하세요.
    `.trim(),
    expectedOutput: '생성된 테이블 5, FK ≥ 3',
    localPractice: `완성한 스키마를 **빈 데이터베이스** 에서 처음부터 실행하세요.

\`\`\`sql
DROP DATABASE study; CREATE DATABASE study; USE study;
\`\`\`

1. 파일 전체를 붙여 넣어 한 번에 실행합니다. 테이블 순서가 틀리면 \`ERROR 1824\` (참조할 테이블이 없음) 가 납니다. 부모 테이블이 먼저 와야 합니다.
2. 외래키를 DB 가 어떻게 기록했는지 확인합니다.

\`\`\`sql
SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'study' AND REFERENCED_TABLE_NAME IS NOT NULL;
\`\`\`

3. 사용자, 글, 댓글, 태그를 몇 건씩 넣고 \`users\` 를 삭제해 어디까지 연쇄 삭제되는지 보세요.
4. 마지막으로 5개 테이블을 지우는 \`DROP\` 순서를 직접 정해 보세요. 자식부터 지워야 합니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: 5개 테이블 (users, posts, comments, tags, post_tags) 을 완성하세요.
-- 힌트와 정답을 참고하되, 가능하면 본인의 설계로 먼저 시도해보세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?users`?/i,
        message: 'users 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?posts`?/i,
        message: 'posts 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?comments`?/i,
        message: 'comments 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?tags`?/i,
        message: 'tags 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?post_tags`?/i,
        message: 'post_tags 조인 테이블이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /(?:FOREIGN\s+KEY[\s\S]*?){3,}/i,
        message: '최소 3개의 FOREIGN KEY 정의가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY\s*\(\s*post_id\s*,\s*tag_id\s*\)/i,
        message: 'post_tags 의 복합 기본키가 필요합니다.'
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
      content: '먼저 `users` 와 `posts` 부터 만들고, 그 다음 `comments`, 마지막으로 `tags` / `post_tags` 순으로 작성하세요.'
    },
    {
      level: 2,
      content: '`comments` 는 `posts(id)` 와 `users(id)` 두 개의 외래키를 동시에 가집니다. 사용자가 사라져도 댓글은 남겨두고 싶다면 `ON DELETE SET NULL` 도 고려해보세요.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
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
`
    }
  ]
}
