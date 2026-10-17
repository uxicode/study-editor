import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p1: CurriculumStep = {
  id: 'week-2-3-p1',
  title: '1주차 · 연습 ① 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — NOT NULL 과 DEFAULT',
  order: 10,
  category: 'schema',
  content: {
    mission:
      '`posts` 테이블에 `title VARCHAR(200) NOT NULL` 과 `view_count INT NOT NULL DEFAULT 0` 을 정의하세요.',
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
      'posts 에 NOT NULL / DEFAULT 적용',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'NOT NULL 과 DEFAULT — 모든 채점 항목 통과'
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
        pattern: /\btitle\s+VARCHAR\s*\(\s*200\s*\)[^,]*NOT\s+NULL/i,
        message: 'title VARCHAR(200) NOT NULL 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bview_count\s+INT[^,]*NOT\s+NULL/i,
        message: 'view_count INT 에 NOT NULL 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bview_count\s+INT[^,]*DEFAULT\s+0\b/i,
        message: 'view_count 에 DEFAULT 0 이 필요합니다.'
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
      content: '`view_count INT NOT NULL DEFAULT 0` 처럼 제약을 나열합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- title VARCHAR(200) NOT NULL 이 필요합니다.
- view_count INT 에 NOT NULL 이 필요합니다.
- view_count 에 DEFAULT 0 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE posts (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  view_count INT          NOT NULL DEFAULT 0
);
`
    }
  ]
}
