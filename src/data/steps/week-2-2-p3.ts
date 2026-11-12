import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2_p3: CurriculumStep = {
  id: 'week-2-2-p3',
  title: '1주차 · 연습 ③ 기본키와 자동증가 — 취소된 주문 번호는 왜 비어 있을까',
  order: 8,
  category: 'schema',
  content: {
    mission: '`orders` 테이블을 만들고, 삭제된 주문 번호가 다시 쓰이지 않는 현상이 버그인지 판단해 주석으로 서술하세요.',
    theory: `
      ## 복습: 기본키와 AUTO_INCREMENT

      \`\`\`sql
      id INT AUTO_INCREMENT PRIMARY KEY
      \`\`\`

      - \`PRIMARY KEY\` 는 행을 유일하게 식별하며 NULL 과 중복을 허용하지 않습니다.
      - \`AUTO_INCREMENT\` 는 INSERT 때 자동으로 증가하는 번호를 붙입니다.
      - 삭제된 번호는 다시 쓰지 않고 계속 증가합니다.
    `,
    objectives: [
      'AUTO_INCREMENT 번호가 재사용되지 않는 동작 이해',
      '번호 재사용의 위험 이해',
      '직전 스텝(기본키와 자동증가)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
운영팀에서 문의가 들어왔습니다.
> "주문 1, 2, 3번이 있었는데 3번 주문이 취소(삭제)됐어요. 그 뒤에 들어온 주문이 3번이 아니라 4번으로 저장됐는데, 번호가 하나 비는 건 버그 아닌가요?"

**요구사항**
1. 주문을 저장하는 \`orders\` 테이블을 만드세요. (포함할 컬럼: \`order_id\`, \`ordered_at\`)
2. \`order_id\` 는 자동 증가하는 기본키입니다.
3. \`ordered_at\` 은 주문한 날짜와 시각입니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 운영팀 문의에 답하듯이, 이 현상이 버그인지 아닌지와 그 이유를 서술해 주세요.
- 만약 삭제된 3번을 새 주문에 다시 쓴다면 어떤 문제가 생길 수 있는지도 적어 주세요. (예: 고객이 받은 주문 확인 메일, 환불 기록)
    `.trim(),
    expectedOutput: '취소된 주문 번호는 왜 비어 있을까 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?orders\s*\(/i,
        message: 'orders 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /order_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'order_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /ordered_at\s+(?:DATETIME|TIMESTAMP)\b/i,
        message: 'ordered_at 은 날짜와 시각을 함께 담아야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:버그|정상|재사용|다시 쓰)/,
        message: '버그인지 여부와 이유를 -- 주석으로 서술해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:메일|환불|기록|혼동|다른 주문)/,
        message: '번호를 재사용할 때의 문제를 -- 주석으로 서술해야 합니다.'
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
      content: 'AUTO_INCREMENT 는 한 번 발급한 번호를 다시 쓰지 않습니다. 주문 번호가 테이블 밖(메일, 문자, 다른 시스템)에도 남는다는 점을 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- orders 테이블을 만들어야 합니다.
- order_id 를 자동 증가하는 기본키로 정의해야 합니다.
- ordered_at 은 날짜와 시각을 함께 담아야 합니다.
- 버그인지 여부와 이유를 -- 주석으로 서술해야 합니다.
- 번호를 재사용할 때의 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 버그가 아닙니다. AUTO_INCREMENT 는 삭제된 번호를 재사용하지 않는 것이 정상 동작입니다.
-- 3번을 다시 쓰면 고객이 받은 "3번 주문" 메일이나 환불 기록이 전혀 다른 주문을 가리키게 되어 혼동이 생깁니다.
CREATE TABLE orders (
  order_id   INT AUTO_INCREMENT PRIMARY KEY,
  ordered_at DATETIME
);
`
    }
  ]
}
