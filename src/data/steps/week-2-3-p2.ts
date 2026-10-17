import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p2: CurriculumStep = {
  id: 'week-2-3-p2',
  title: '1주차 · 연습 ② 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — CHECK 제약',
  order: 11,
  category: 'schema',
  content: {
    mission:
      '`products` 테이블에 `price DECIMAL(10,2) NOT NULL CHECK (price >= 0)` 과 `stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0)` 을 정의하세요.',
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
      '음수를 막는 CHECK 적용',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'CHECK 제약 — 모든 채점 항목 통과'
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
        pattern: /\bprice\s+DECIMAL\s*\(\s*10\s*,\s*2\s*\)[^,]*CHECK\s*\(\s*price\s*>=\s*0\s*\)/i,
        message: 'price DECIMAL(10,2) 에 CHECK (price >= 0) 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bstock\s+INT[^,]*DEFAULT\s+0\b/i,
        message: 'stock 에 DEFAULT 0 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bCHECK\s*\(\s*stock\s*>=\s*0\s*\)/i,
        message: 'stock 에 CHECK (stock >= 0) 이 필요합니다.'
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
      content: '컬럼 정의 끝에 `CHECK (price >= 0)` 을 붙입니다. `stock` 은 `DEFAULT 0` 과 `CHECK (stock >= 0)` 을 함께 씁니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- price DECIMAL(10,2) 에 CHECK (price >= 0) 이 필요합니다.
- stock 에 DEFAULT 0 이 필요합니다.
- stock 에 CHECK (stock >= 0) 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE products (
  id    INT           AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(100)  NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INT           NOT NULL DEFAULT 0 CHECK (stock >= 0)
);
`
    }
  ]
}
