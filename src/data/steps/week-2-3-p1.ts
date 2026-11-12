import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p1: CurriculumStep = {
  id: 'week-2-3-p1',
  title: '1주차 · 연습 ① 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — 게시글 필수값과 기본값',
  order: 10,
  category: 'schema',
  content: {
    mission: '게시글 `posts` 테이블에서 제목은 필수로, 조회수와 작성 시각은 값을 주지 않아도 자동으로 채워지게 하세요.',
    theory: `
      ## 복습: 제약조건

      | 제약조건   | 의미 |
      |-----------|------|
      | NOT NULL   | NULL 불가 |
      | UNIQUE     | 테이블 내 유일 |
      | DEFAULT v  | 기본값 |
      | CHECK (…)  | 조건을 만족해야 저장 |

      - 한 컬럼에 여러 제약을 나열할 수 있습니다: \`price DECIMAL(10,2) NOT NULL CHECK (price >= 0)\`
      - 여러 컬럼 조합의 유일성은 테이블 레벨 \`UNIQUE (a, b)\` 로 표현합니다.
    `,
    objectives: [
      'NOT NULL 과 DEFAULT 를 함께 쓰는 이유 이해',
      '작성 시각 기본값 지정',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
게시판 글 작성 API 는 제목과 본문만 받습니다. 조회수는 처음에 0 이어야 하고, 작성 시각은 저장되는 순간의 시각이어야 합니다. 그런데 제목 없이 저장된 글이 목록에 빈 줄로 보이는 문제가 있었습니다.

**요구사항**
1. \`posts\` 테이블을 만드세요. (포함할 컬럼: \`post_id\`, \`title\`, \`view_count\`, \`created_at\`)
2. \`post_id\` 는 자동 증가하는 기본키입니다.
3. 제목이 없는 글은 저장되지 않아야 합니다. (\`title\` 최대 200자)
4. \`view_count\` 는 값을 주지 않으면 0 으로 저장되고, 비어 있는 값(NULL)이 될 수 없어야 합니다.
5. \`created_at\` 은 값을 주지 않으면 저장 시점의 시각으로 채워집니다. (참고: \`DEFAULT CURRENT_TIMESTAMP\`)

**생각해 보기** (\`--\` 주석으로 작성)
- \`view_count\` 에 \`DEFAULT 0\` 만 있고 \`NOT NULL\` 이 없으면 어떤 값이 저장될 수 있고, 그때 "조회수 + 1" 계산이 어떻게 되는지 서술해 주세요.
    `.trim(),
    expectedOutput: '게시글 필수값과 기본값 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?posts\s*\(/i,
        message: 'posts 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /post_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'post_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /title\s+VARCHAR\s*\(\s*200\s*\)[^,\n]*NOT\s+NULL/i,
        message: '제목이 없는 글은 저장되지 않아야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /view_count\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*DEFAULT\s+0\b/i,
        message: 'view_count 의 기본값을 0 으로 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /view_count\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*NOT\s+NULL/i,
        message: 'view_count 는 NULL 이 될 수 없어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /created_at\s+(?:DATETIME|TIMESTAMP)\b[^,\n]*DEFAULT\s+(?:CURRENT_TIMESTAMP|NOW\s*\(\s*\))/i,
        message: 'created_at 은 저장 시점의 시각으로 채워져야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:NULL)/i,
        message: 'NOT NULL 이 없을 때의 문제를 -- 주석으로 서술해야 합니다.'
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
      content: '`DEFAULT` 는 "값을 아예 안 줬을 때" 만 쓰입니다. 누군가 `NULL` 을 직접 넣으면 어떻게 될지, 그리고 `NULL + 1` 의 결과가 무엇인지 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts 테이블을 만들어야 합니다.
- post_id 를 자동 증가하는 기본키로 정의해야 합니다.
- 제목이 없는 글은 저장되지 않아야 합니다.
- view_count 의 기본값을 0 으로 지정해야 합니다.
- view_count 는 NULL 이 될 수 없어야 합니다.
- created_at 은 저장 시점의 시각으로 채워져야 합니다.
- NOT NULL 이 없을 때의 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- DEFAULT 0 만 있으면 값을 생략할 때만 0 이 되고, NULL 을 직접 넣으면 NULL 이 저장됩니다.
-- NULL + 1 은 NULL 이라 조회수가 영원히 늘지 않으므로 NOT NULL 도 함께 걸어야 합니다.
CREATE TABLE posts (
  post_id    INT          AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  view_count INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`
    }
  ]
}
