import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2_p2: CurriculumStep = {
  id: 'week-2-2-p2',
  title: '1주차 · 연습 ② 기본키와 자동증가 — 대용량 접속 로그의 id 타입',
  order: 7,
  category: 'schema',
  content: {
    mission: '하루 수천만 건이 쌓이는 `access_logs` 테이블의 기본키 타입을 데이터 규모에 맞게 고르세요.',
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
      '데이터 증가량에 맞는 id 타입 선택',
      'INT 의 최댓값 이해',
      '직전 스텝(기본키와 자동증가)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
서비스의 모든 페이지 접속 기록을 \`access_logs\` 에 저장하려고 합니다. 현재 하루 약 3,000만 건이 쌓이고, 로그는 지우지 않고 계속 보관합니다.

**요구사항**
1. \`access_logs\` 테이블을 만드세요. (포함할 컬럼: \`log_id\`, \`path\`, \`accessed_at\`)
2. \`log_id\` 는 자동 증가하는 기본키이며, **수년간 보관해도 번호가 부족하지 않은** 타입이어야 합니다.
3. \`path\` 는 최대 255자, \`accessed_at\` 은 접속한 날짜와 시각입니다.

**생각해 보기** (\`--\` 주석으로 작성)
- \`log_id\` 를 \`INT\` 로 만들면 대략 언제쯤, 어떤 문제가 생기는지 서술해 주세요.
    `.trim(),
    expectedOutput: '대용량 접속 로그의 id 타입 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?access_logs\s*\(/i,
        message: 'access_logs 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /log_id\s+BIGINT\b/i,
        message: 'log_id 는 수년간 번호가 부족하지 않은 타입이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /log_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'log_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /path\s+VARCHAR\s*\(\s*255\s*\)/i,
        message: 'path 는 최대 255자로 제한해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /accessed_at\s+(?:DATETIME|TIMESTAMP)\b/i,
        message: 'accessed_at 은 날짜와 시각을 함께 담아야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:21억|INT|최댓값|부족|가득)/i,
        message: 'INT 로 만들 때 생기는 문제를 -- 주석으로 서술해야 합니다.'
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
      content: '`INT` 의 최댓값은 약 21억입니다. 하루 3,000만 건이면 며칠이면 가득 차는지 계산해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- access_logs 테이블을 만들어야 합니다.
- log_id 는 수년간 번호가 부족하지 않은 타입이어야 합니다.
- log_id 를 자동 증가하는 기본키로 정의해야 합니다.
- path 는 최대 255자로 제한해야 합니다.
- accessed_at 은 날짜와 시각을 함께 담아야 합니다.
- INT 로 만들 때 생기는 문제를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- INT 의 최댓값은 약 21억이라 하루 3,000만 건이면 약 70일 만에 가득 차고,
-- 그 뒤로는 새 로그를 저장할 수 없습니다. 그래서 BIGINT 를 골랐습니다.
CREATE TABLE access_logs (
  log_id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  path        VARCHAR(255),
  accessed_at DATETIME
);
`
    }
  ]
}
