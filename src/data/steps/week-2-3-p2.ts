import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p2: CurriculumStep = {
  id: 'week-2-3-p2',
  title: '1주차 · 연습 ② 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — 잘못된 가격 · 재고 · 할인율 막기',
  order: 11,
  category: 'schema',
  content: {
    mission: '쇼핑몰 `products` 테이블에 CHECK 제약을 걸어 음수 가격, 음수 재고, 범위를 벗어난 할인율이 저장되지 않게 하세요.',
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
      'CHECK 로 값의 범위 제한',
      'DB 단 검증이 필요한 이유 이해',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
관리자 페이지에서 할인율을 \`150\` 으로 잘못 입력해 상품이 마이너스 가격으로 팔린 사고가 있었습니다. 관리자 화면에는 입력 검증이 있었지만, 다른 팀이 만든 일괄 업로드 스크립트는 검증 없이 DB 에 바로 저장하고 있었습니다.

**요구사항**
1. \`products\` 테이블을 만드세요. (포함할 컬럼: \`product_id\`, \`name\`, \`price\`, \`stock\`, \`discount_rate\`)
2. \`product_id\` 는 자동 증가하는 기본키, \`name\` 은 필수이며 최대 100자입니다.
3. \`price\` 는 소수점 둘째 자리까지 저장하고 0 이상이어야 합니다.
4. \`stock\` 은 0 이상이어야 합니다.
5. \`discount_rate\` 는 0 부터 100 사이의 정수만 허용합니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 화면(애플리케이션)에서 이미 입력을 검증하는데도 DB 에 CHECK 를 거는 이유를 이번 사고를 예로 들어 서술해 주세요.
    `.trim(),
    expectedOutput: '잘못된 가격 · 재고 · 할인율 막기 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?products\s*\(/i,
        message: 'products 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /product_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'product_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /name\s+VARCHAR\s*\(\s*100\s*\)[^,\n]*NOT\s+NULL/i,
        message: 'name 은 필수이며 최대 100자여야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CHECK\s*\(\s*price\s*>=\s*0\s*\)/i,
        message: 'price 가 0 이상이어야 한다는 제약이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CHECK\s*\(\s*stock\s*>=\s*0\s*\)/i,
        message: 'stock 이 0 이상이어야 한다는 제약이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CHECK\s*\(\s*discount_rate\s+(?:BETWEEN\s+0\s+AND\s+100|>=\s*0\s+AND\s+discount_rate\s*<=\s*100)\s*\)/i,
        message: 'discount_rate 를 0~100 으로 제한해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:스크립트|우회|다른 경로|여러|애플리케이션|화면)/,
        message: 'DB 에도 CHECK 를 거는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '범위는 `CHECK (discount_rate BETWEEN 0 AND 100)` 처럼 표현합니다. 데이터가 DB 에 들어오는 경로가 화면 하나뿐인지 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- products 테이블을 만들어야 합니다.
- product_id 를 자동 증가하는 기본키로 정의해야 합니다.
- name 은 필수이며 최대 100자여야 합니다.
- price 가 0 이상이어야 한다는 제약이 필요합니다.
- stock 이 0 이상이어야 한다는 제약이 필요합니다.
- discount_rate 를 0~100 으로 제한해야 합니다.
- DB 에도 CHECK 를 거는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 데이터는 관리자 화면뿐 아니라 업로드 스크립트, 다른 서비스 등 여러 경로로 들어오므로
-- 화면 검증만으로는 이번처럼 우회될 수 있습니다. DB 의 CHECK 는 어떤 경로든 마지막에 막아 줍니다.
CREATE TABLE products (
  product_id    INT           AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  price         DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock         INT           NOT NULL DEFAULT 0 CHECK (stock >= 0),
  discount_rate INT           NOT NULL DEFAULT 0 CHECK (discount_rate BETWEEN 0 AND 100)
);
`
    }
  ]
}
