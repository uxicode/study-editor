import type { CurriculumStep } from '@/types/curriculum'

export const week_2_final_p1: CurriculumStep = {
  id: 'week-2-final-p1',
  title: '1주차 · 연습 ① 게시판 스키마 설계 — 게시글 공개 상태 관리',
  order: 26,
  category: 'advanced',
  content: {
    mission: '`posts.status` 에 임시저장 / 발행 / 숨김 세 가지 값만 저장되도록 제약을 추가하세요.',
    theory: `
      ## 복습: 게시판 스키마를 더 단단하게

      - \`CHECK (컬럼 IN ('a', 'b'))\` 로 허용 값 목록을 제한할 수 있습니다.
      - 자주 조회하는 조건 / 정렬 컬럼에는 \`CREATE INDEX 이름 ON 테이블 (컬럼, ...)\` 로 인덱스를 만듭니다.
      - N:M 관계 조회는 조인 테이블을 가운데 두고 JOIN 을 연결합니다:
        \`posts → post_tags → tags\`, 작성자는 \`posts → users\`
    `,
    objectives: [
      'CHECK IN 으로 허용 값 목록 제한',
      '자유 입력 상태 값의 문제 이해',
      '직전 스텝(게시판 스키마 설계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
게시글에는 임시저장(\`'draft'\`), 발행(\`'published'\`), 신고로 인한 숨김(\`'hidden'\`) 세 가지 상태가 있습니다. 그런데 DB 를 열어 보니 \`'Published'\`, \`'publish'\`, \`'공개'\` 같은 값이 섞여 있어서, 발행된 글 목록에서 일부 글이 빠지고 있었습니다.

**요구사항**
1. 아래 스키마의 \`posts\` 정의를 고쳐, \`status\` 에 세 가지 값만 저장되도록 제약을 추가하세요.
2. 기본값 \`'draft'\` 와 \`NOT NULL\` 은 그대로 유지합니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 상태 값을 제약 없이 자유롭게 저장하면 "발행된 글 목록" 에서 글이 빠지는 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '게시글 공개 상태 관리 — 모든 채점 항목 통과'
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
        pattern: /status\s+VARCHAR\s*\(\s*\d+\s*\)[^,\n]*CHECK\s*\(\s*status\s+IN\s*\(\s*'draft'\s*,\s*'published'\s*,\s*'hidden'\s*\)\s*\)/i,
        message: 'status 에 \'draft\', \'published\', \'hidden\' 만 허용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /status\s+VARCHAR\s*\(\s*\d+\s*\)[^,\n]*NOT\s+NULL[^,\n]*DEFAULT\s+'draft'|status\s+VARCHAR\s*\(\s*\d+\s*\)[^,\n]*DEFAULT\s+'draft'[^,\n]*NOT\s+NULL/i,
        message: 'status 의 NOT NULL 과 기본값 \'draft\' 를 유지해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:published|발행|목록|빠)/i,
        message: '자유 입력일 때 글이 빠지는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`CHECK (status IN (\'draft\', \'published\', \'hidden\'))` 처럼 허용 값 목록을 적습니다. 발행된 글 목록이 어떤 조건으로 글을 고르는지 떠올려 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- status 에 'draft', 'published', 'hidden' 만 허용해야 합니다.
- status 의 NOT NULL 과 기본값 'draft' 를 유지해야 합니다.
- 자유 입력일 때 글이 빠지는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 발행된 글 목록은 status = 'published' 로 고르는데, 'Published' 나 '공개' 는 이 조건과 다른 값이라 목록에서 빠집니다.
-- CHECK 로 허용 값을 세 가지로 고정하면 오타나 다른 표기가 처음부터 저장되지 않습니다.
CREATE TABLE posts (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL,
  content    TEXT,
  status     VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'hidden')),
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`
    }
  ]
}
