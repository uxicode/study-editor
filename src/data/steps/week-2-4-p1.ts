import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p1: CurriculumStep = {
  id: 'week-2-4-p1',
  title: '1주차 · 연습 ① 외래키와 1:N 관계 — 게시글과 함께 지워지는 댓글',
  order: 14,
  category: 'relations',
  content: {
    mission: '`comments` 테이블을 만들고, 글이 삭제되면 그 글의 댓글도 함께 삭제되도록 이름 붙인 외래키를 정의하세요.',
    theory: `
      ## 복습: 외래키와 ON DELETE

      \`\`\`sql
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      CONSTRAINT 이름 FOREIGN KEY (...) REFERENCES 부모(키)
      \`\`\`

      | 동작 | 부모 삭제 시 |
      |------|--------------|
      | CASCADE  | 자식도 함께 삭제 |
      | SET NULL | 자식의 FK 가 NULL (컬럼이 NULL 허용이어야 함) |
      | RESTRICT | 자식이 있으면 삭제 거부 |

      - 존재하지 않는 부모를 가리키는 INSERT 는 \`ERROR 1452\` 로 거부됩니다.
    `,
    objectives: [
      '이름 붙인 외래키(CONSTRAINT) 정의',
      'ON DELETE CASCADE 가 어울리는 경우 이해',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
게시판에 댓글 기능을 추가합니다. 글이 삭제된 뒤에도 댓글만 DB 에 남아 있어서, "최근 댓글" 위젯을 누르면 "존재하지 않는 글" 페이지로 이동하는 문제가 있었습니다. 장애가 났을 때 에러 로그에서 어떤 제약 때문인지 바로 알 수 있도록 외래키에 이름도 붙이기로 했습니다.

**요구사항**
1. 위의 \`users\`, \`posts\` 아래에 \`comments\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`post_id\`, \`content\`)
2. \`id\` 는 자동 증가하는 기본키, \`content\` 는 필수인 긴 글입니다.
3. 모든 댓글은 반드시 하나의 글에 속합니다.
4. \`post_id\` 가 \`posts(id)\` 를 참조하도록 외래키를 \`fk_comments_post\` 라는 이름으로 정의하고, 글이 삭제되면 댓글도 함께 삭제되게 하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- 글이 지워졌는데 댓글이 남아 있으면 생기는 문제를 서술해 주세요.
    `.trim(),
    expectedOutput: '게시글과 함께 지워지는 댓글 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?comments\s*\(/i,
        message: 'comments 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /post_id\s+INT\b[^,\n]*NOT\s+NULL/i,
        message: '모든 댓글은 반드시 하나의 글에 속해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /content\s+(?:MEDIUM|LONG)?TEXT\b[^,\n]*NOT\s+NULL/i,
        message: 'content 는 필수인 긴 글이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CONSTRAINT\s+fk_comments_post\s+FOREIGN\s+KEY\s*\(\s*post_id\s*\)\s*REFERENCES\s+posts\s*\(\s*id\s*\)/i,
        message: 'fk_comments_post 라는 이름의 외래키로 posts(id) 를 참조해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /fk_comments_post[^;]*ON\s+DELETE\s+CASCADE/i,
        message: '글이 삭제되면 댓글도 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:남|고아|존재하지|의미)/,
        message: '댓글만 남을 때의 문제를 -- 주석으로 서술해야 합니다.'
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
      content: '`CONSTRAINT 이름 FOREIGN KEY (컬럼) REFERENCES 부모(컬럼) ON DELETE ...` 형식입니다. 부모 없이는 의미가 없는 데이터에는 어떤 삭제 동작이 어울렸는지 이론 표를 다시 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- comments 테이블을 만들어야 합니다.
- 모든 댓글은 반드시 하나의 글에 속해야 합니다.
- content 는 필수인 긴 글이어야 합니다.
- fk_comments_post 라는 이름의 외래키로 posts(id) 를 참조해야 합니다.
- 글이 삭제되면 댓글도 함께 삭제되어야 합니다.
- 댓글만 남을 때의 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 글이 지워져도 댓글이 남으면 어느 글에도 속하지 않는 고아 데이터가 되어
-- 존재하지 않는 글로 연결되거나, 댓글 수 집계가 틀어집니다.
CREATE TABLE comments (
  id      INT  AUTO_INCREMENT PRIMARY KEY,
  post_id INT  NOT NULL,
  content TEXT NOT NULL,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
`
    }
  ]
}
