import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p3: CurriculumStep = {
  id: 'week-2-4-p3',
  title: '1주차 · 연습 ③ 외래키와 1:N 관계 — 주문 내역은 지키고, 주문 항목은 함께 지우기',
  order: 16,
  category: 'relations',
  content: {
    mission: '주문(`orders`)과 주문 항목(`order_items`)의 외래키에 요구사항에 맞는 삭제 동작을 각각 고르세요.',
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
      'RESTRICT 와 CASCADE 를 요구사항에 맞게 선택',
      '한 스키마 안에서 다른 삭제 동작을 함께 쓰기',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
쇼핑몰의 주문 내역은 세법상 5년간 보관해야 합니다. 그런데 관리자가 실수로 회원을 삭제하면 그 회원의 주문 내역까지 사라질 수 있다는 지적이 나왔습니다. 반면 주문 하나에 딸린 상품 목록(주문 항목)은 주문이 없으면 의미가 없습니다.

**요구사항**
1. 위의 \`users\` 아래에 \`orders\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`user_id\`, \`ordered_at\`)
   - 주문이 하나라도 있는 회원은 **삭제 자체가 거부**되어야 합니다.
2. \`order_items\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`order_id\`, \`product_name\`, \`quantity\`)
   - 주문이 삭제되면 그 주문의 항목도 함께 삭제되어야 합니다.
3. 두 테이블의 \`id\` 는 자동 증가하는 기본키이고, FK 컬럼은 반드시 값이 있어야 합니다.

**생각해 보기** (\`--\` 주석으로 작성)
- \`orders\` 와 \`order_items\` 에 서로 다른 삭제 동작을 고른 이유를 각각 서술해 주세요.
    `.trim(),
    expectedOutput: '주문 내역은 지키고, 주문 항목은 함께 지우기 — 모든 채점 항목 통과'
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

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?orders\s*\(/i,
        message: 'orders 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?order_items\s*\(/i,
        message: 'order_items 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+orders\s*\([^;]*user_id\s+INT\b[^,\n]*NOT\s+NULL/i,
        message: 'orders.user_id 는 반드시 값이 있어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+orders\s*\([^;]*REFERENCES\s+users\s*\(\s*id\s*\)\s*ON\s+DELETE\s+(?:RESTRICT|NO\s+ACTION)/i,
        message: '주문이 있는 회원은 삭제가 거부되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+order_items\s*\([^;]*order_id\s+INT\b[^,\n]*NOT\s+NULL/i,
        message: 'order_items.order_id 는 반드시 값이 있어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+order_items\s*\([^;]*REFERENCES\s+orders\s*\(\s*id\s*\)\s*ON\s+DELETE\s+CASCADE/i,
        message: '주문이 삭제되면 주문 항목도 함께 삭제되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:RESTRICT|보관|거부)/i,
        message: 'orders 의 삭제 동작을 고른 이유를 -- 주석으로 서술해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:CASCADE|함께|의미)/i,
        message: 'order_items 의 삭제 동작을 고른 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '"삭제 자체를 거부" 는 `RESTRICT`, "함께 삭제" 는 `CASCADE` 입니다. 부모 테이블(`orders`)을 자식(`order_items`)보다 먼저 만들어야 합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- orders 테이블을 만들어야 합니다.
- order_items 테이블을 만들어야 합니다.
- orders.user_id 는 반드시 값이 있어야 합니다.
- 주문이 있는 회원은 삭제가 거부되어야 합니다.
- order_items.order_id 는 반드시 값이 있어야 합니다.
- 주문이 삭제되면 주문 항목도 함께 삭제되어야 합니다.
- orders 의 삭제 동작을 고른 이유를 -- 주석으로 서술해야 합니다.
- order_items 의 삭제 동작을 고른 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- orders: 주문 내역은 5년간 보관해야 하므로, 주문이 있는 회원은 RESTRICT 로 삭제를 거부합니다.
-- order_items: 주문 없이는 의미가 없는 데이터이므로 CASCADE 로 주문과 함께 삭제합니다.
CREATE TABLE orders (
  id         INT      AUTO_INCREMENT PRIMARY KEY,
  user_id    INT      NOT NULL,
  ordered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE order_items (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  order_id     INT          NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity     INT          NOT NULL CHECK (quantity >= 1),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
`
    }
  ]
}
