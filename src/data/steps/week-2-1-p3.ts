import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p3: CurriculumStep = {
  id: 'week-2-1-p3',
  title: '1주차 · 연습 ③ CREATE TABLE 기본 — products 와 DECIMAL',
  order: 4,
  category: 'schema',
  content: {
    mission:
      '`products` 테이블을 만드세요 (`id INT`, `name VARCHAR(100)`, `price DECIMAL(10,2)`, `created_at DATETIME`). 가격에 `FLOAT` 대신 `DECIMAL` 을 쓰는 이유를 SQL 주석(`--`)으로 적되 `DECIMAL` 이라는 단어를 포함하세요.',
    theory: `
      ## 복습: CREATE TABLE

      \`\`\`sql
      CREATE TABLE 테이블명 (
        컬럼명 타입,
        컬럼명 타입
      );
      \`\`\`

      - 문자열: \`VARCHAR(길이)\`, 긴 글: \`TEXT\`, 정수: \`INT\`
      - 돈처럼 오차가 있으면 안 되는 소수: \`DECIMAL(전체자릿수, 소수자릿수)\`
      - 시각: \`DATETIME\`
      - SQL 주석은 \`--\` 로 시작합니다.
    `,
    objectives: [
      '금액 컬럼에 DECIMAL 을 쓰는 이유 설명하기',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'products 와 DECIMAL — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?products`?\s*\(/i,
        message: 'products 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bprice\s+DECIMAL\s*\(\s*10\s*,\s*2\s*\)/i,
        message: 'price DECIMAL(10,2) 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bcreated_at\s+DATETIME\b/i,
        message: 'created_at DATETIME 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(DECIMAL|FLOAT|소수|오차)/i,
        message: 'DECIMAL 을 쓰는 이유를 -- 주석으로 적어야 합니다.'
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
      content: '`price DECIMAL(10,2)` 로 정의하고, `--` 주석에 DECIMAL 을 쓰는 이유(FLOAT 은 오차)를 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- products 테이블을 생성해야 합니다.
- price DECIMAL(10,2) 컬럼이 필요합니다.
- created_at DATETIME 컬럼이 필요합니다.
- DECIMAL 을 쓰는 이유를 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 가격은 소수점 오차가 없는 DECIMAL 을 사용합니다. (FLOAT 은 오차가 생길 수 있음)
CREATE TABLE products (
  id         INT,
  name       VARCHAR(100),
  price      DECIMAL(10,2),
  created_at DATETIME
);
`
    }
  ]
}
