import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5_p3: CurriculumStep = {
  id: 'week-2-5-p3',
  title: '1주차 · 연습 ③ 정규화와 N:M 조인 테이블 — 좋아요는 한 번만',
  order: 20,
  category: 'relations',
  content: {
    mission: '한 사용자가 같은 글에 좋아요를 한 번만 누를 수 있도록 `post_likes` 조인 테이블을 설계하세요.',
    theory: `
      ## 복습: N:M 관계와 조인 테이블

      \`\`\`sql
      CREATE TABLE post_tags (
        post_id INT NOT NULL,
        tag_id  INT NOT NULL,
        PRIMARY KEY (post_id, tag_id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (tag_id)  REFERENCES tags(id)
      );
      \`\`\`

      - 두 외래키를 묶은 복합 PK 가 같은 쌍의 중복을 막습니다.
      - 조인 테이블에는 관계 자체의 속성(생성 시각 등)을 추가할 수 있습니다.
    `,
    objectives: [
      '복합 기본키로 중복 행 방지',
      '대리키(id)만 둘 때의 문제 이해',
      '직전 스텝(정규화와 N:M 조인 테이블)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
게시글 "좋아요" 기능을 만듭니다. 처음 만든 테이블은 \`id AUTO_INCREMENT\` 기본키와 \`user_id\`, \`post_id\` 만 있었는데, 버튼을 여러 번 누르면 좋아요 수가 계속 올라가는 버그가 발견되었습니다.

**요구사항**
1. 위의 \`users\`, \`posts\` 아래에 \`post_likes\` 테이블을 만드세요. (포함할 컬럼: \`user_id\`, \`post_id\`, \`created_at\`)
2. 한 사용자가 같은 글에 좋아요를 두 번 저장할 수 없도록 기본키를 정의하세요.
3. 두 컬럼은 각각 \`users\`, \`posts\` 를 참조하고, 사용자나 글이 삭제되면 좋아요도 삭제됩니다.
4. \`created_at\` 은 값을 주지 않으면 저장 시점의 시각입니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 처음 설계처럼 \`id\` 만 기본키로 두었을 때 같은 좋아요가 여러 번 저장된 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '좋아요는 한 번만 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
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

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?post_likes\s*\(/i,
        message: 'post_likes 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+post_likes\s*\([^;]*PRIMARY\s+KEY\s*\(\s*(?:user_id\s*,\s*post_id|post_id\s*,\s*user_id)\s*\)/i,
        message: '같은 사용자가 같은 글에 두 번 저장할 수 없도록 기본키를 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+post_likes\s*\([^;]*FOREIGN\s+KEY\s*\(\s*user_id\s*\)\s*REFERENCES\s+users\s*\(\s*id\s*\)\s*ON\s+DELETE\s+CASCADE/i,
        message: 'user_id 는 users(id) 를 참조하고 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+post_likes\s*\([^;]*FOREIGN\s+KEY\s*\(\s*post_id\s*\)\s*REFERENCES\s+posts\s*\(\s*id\s*\)\s*ON\s+DELETE\s+CASCADE/i,
        message: 'post_id 는 posts(id) 를 참조하고 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+post_likes\s*\([^;]*created_at\s+(?:DATETIME|TIMESTAMP)\b[^,\n]*DEFAULT\s+(?:CURRENT_TIMESTAMP|NOW\s*\(\s*\))/i,
        message: 'created_at 은 저장 시점의 시각으로 채워져야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:중복|두 번|여러 번|매번|새 번호|다른 id)/,
        message: 'id 만 기본키일 때 중복이 생긴 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`id` 는 저장할 때마다 새 번호가 발급되므로, `(user_id, post_id)` 가 같아도 서로 다른 행이 됩니다. 두 컬럼을 묶어 기본키로 만들어 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- post_likes 테이블을 만들어야 합니다.
- 같은 사용자가 같은 글에 두 번 저장할 수 없도록 기본키를 정의해야 합니다.
- user_id 는 users(id) 를 참조하고 함께 삭제되어야 합니다.
- post_id 는 posts(id) 를 참조하고 함께 삭제되어야 합니다.
- created_at 은 저장 시점의 시각으로 채워져야 합니다.
- id 만 기본키일 때 중복이 생긴 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE users (
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

-- id 는 저장할 때마다 새 번호가 발급되어, (user_id, post_id) 가 같아도 매번 다른 행으로 저장됩니다.
-- (user_id, post_id) 를 기본키로 묶으면 같은 조합의 두 번째 저장은 중복으로 거부됩니다.
CREATE TABLE post_likes (
  user_id    INT      NOT NULL,
  post_id    INT      NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
`
    }
  ]
}
