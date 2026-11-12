import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p3: CurriculumStep = {
  id: 'week-2-1-p3',
  title: '1주차 · 연습 ③ CREATE TABLE 기본 — 쇼핑몰 상품 가격과 재고',
  order: 4,
  category: 'schema',
  content: {
    mission: '쇼핑몰 `products` 테이블을 만들고, 가격과 재고에 오차나 음수가 생기지 않는 타입을 고르세요.',
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
      '금액에 DECIMAL 을 쓰는 이유 이해',
      'UNSIGNED 로 음수 범위 제외하기',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
해외 고객도 이용하는 쇼핑몰이라 가격을 \`19.99\` 처럼 소수점 둘째 자리까지 저장합니다. 정산팀에서 "합계 금액이 1원(1센트)도 틀리면 안 된다" 고 요청했습니다. 재고는 0개 미만이 될 수 없습니다.

**요구사항**
1. \`products\` 테이블을 만드세요. (포함할 컬럼: \`product_id\`, \`name\`, \`price\`, \`stock\`)
2. \`name\` 은 최대 100자입니다.
3. \`price\` 는 소수점 둘째 자리까지 **오차 없이** 저장되는 타입이어야 합니다.
4. \`stock\` 은 정수이며, 음수 범위를 아예 쓰지 않도록 지정하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- \`price\` 를 \`FLOAT\` 로 만들면 정산에서 어떤 문제가 생길 수 있는지 서술해 주세요.
    `.trim(),
    expectedOutput: '쇼핑몰 상품 가격과 재고 — 모든 채점 항목 통과'
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
        pattern: /name\s+VARCHAR\s*\(\s*100\s*\)/i,
        message: 'name 은 최대 100자로 제한해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /price\s+DECIMAL\s*\(\s*\d+\s*,\s*2\s*\)/i,
        message: 'price 는 소수점 둘째 자리까지 오차 없이 저장해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /stock\s+(?:TINYINT|SMALLINT|MEDIUMINT|INT|BIGINT)\s+UNSIGNED/i,
        message: 'stock 은 음수 범위를 쓰지 않는 정수여야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:FLOAT|오차|반올림|근사)/i,
        message: 'FLOAT 를 쓸 때의 문제를 -- 주석으로 서술해야 합니다.'
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
      content: '금액처럼 정확해야 하는 소수는 `DECIMAL(전체자리수, 소수자리수)` 로 저장합니다. 정수 타입 뒤에 `UNSIGNED` 를 붙이면 0 이상만 저장합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- products 테이블을 만들어야 합니다.
- name 은 최대 100자로 제한해야 합니다.
- price 는 소수점 둘째 자리까지 오차 없이 저장해야 합니다.
- stock 은 음수 범위를 쓰지 않는 정수여야 합니다.
- FLOAT 를 쓸 때의 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- FLOAT 는 소수를 근사값으로 저장해서 19.99 가 19.9899... 처럼 저장될 수 있고,
-- 여러 건을 더하면 오차가 쌓여 정산 합계가 맞지 않게 됩니다.
CREATE TABLE products (
  product_id INT,
  name       VARCHAR(100),
  price      DECIMAL(10, 2),
  stock      INT UNSIGNED
);
`
    }
  ]
}
