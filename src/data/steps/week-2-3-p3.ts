import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p3: CurriculumStep = {
  id: 'week-2-3-p3',
  title: '1주차 · 연습 ③ 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — 복합 UNIQUE',
  order: 12,
  category: 'schema',
  content: {
    mission:
      '`first_name`, `last_name` 컬럼이 있는 `members` 테이블을 만들고 테이블 레벨 제약 `UNIQUE (first_name, last_name)` 을 추가하세요. 이름+성이 같은 두 사람이 가입할 수 있는지 `허용` 여부를 SQL 주석으로 설명하세요.',
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
      '여러 컬럼 조합의 유일성 표현',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    expectedOutput: '복합 UNIQUE — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?members`?\s*\(/i,
        message: 'members 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /UNIQUE\s*(KEY\s*\w*\s*)?\(\s*first_name\s*,\s*last_name\s*\)/i,
        message: 'UNIQUE (first_name, last_name) 복합 제약이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(동명이인|같은 이름|허용|가입)/,
        message: '복합 UNIQUE 의 허용 여부를 -- 주석으로 설명해야 합니다.'
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
      content: '컬럼 목록 맨 끝에 `UNIQUE (first_name, last_name)` 을 적습니다. 주석에는 `허용` 이라는 단어로 허용 여부를 설명하세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- members 테이블을 생성해야 합니다.
- UNIQUE (first_name, last_name) 복합 제약이 필요합니다.
- 복합 UNIQUE 의 허용 여부를 -- 주석으로 설명해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 이름+성 조합이 같으면 가입할 수 없고, 성만 같은 경우는 허용됩니다.
CREATE TABLE members (
  id         INT         AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name  VARCHAR(50) NOT NULL,
  UNIQUE (first_name, last_name)
);
`
    }
  ]
}
