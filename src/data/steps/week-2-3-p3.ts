import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3_p3: CurriculumStep = {
  id: 'week-2-3-p3',
  title: '1주차 · 연습 ③ 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK) — 회원 이메일 중복 가입 막기',
  order: 12,
  category: 'schema',
  content: {
    mission: '회원 정보를 관리하는 `users` 테이블을 만들고, 같은 이메일로 중복 가입하지 못하도록 제약을 추가하세요.',
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
      'UNIQUE 로 중복 가입 방지',
      'UNIQUE 와 NULL, 탈퇴 회원 재가입 문제 이해',
      '직전 스텝(제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK))의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
회원가입 버튼을 빠르게 두 번 누른 사용자가 같은 이메일로 계정 두 개가 만들어졌다는 문의를 남겼습니다. 한편 기획팀은 "탈퇴한 회원은 \`status\` 만 \`'withdrawn'\` 으로 바꾸고 데이터는 남겨 두자" 고 결정했습니다.

**요구사항**
1. 회원 정보를 관리하는 \`users\` 테이블을 생성합니다. (포함할 컬럼: \`user_id\`, \`email\`, \`status\`)
2. \`user_id\` 는 자동 증가하는 기본키입니다.
3. 서비스 내에서 동일한 이메일로 중복 가입을 방지하기 위해 \`email\` 컬럼에 제약을 추가해 주세요. (최대 255자)
4. \`status\` 는 최대 20자이며, 가입 시 값을 주지 않으면 \`'active'\` 로 저장됩니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 탈퇴한 회원(\`status = 'withdrawn'\`)이 같은 이메일로 재가입할 때 발생할 수 있는 문제점을 서술해 주세요.
- UNIQUE 제약이 NULL 값을 처리하는 방식을 서술해 주세요. (\`email\` 이 NULL 인 행이 여러 개 있으면 어떻게 될까요?)
    `.trim(),
    expectedOutput: '회원 이메일 중복 가입 막기 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?users\s*\(/i,
        message: 'users 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /user_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'user_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /email\s+VARCHAR\s*\(\s*255\s*\)[^,\n]*UNIQUE|UNIQUE\s*(?:KEY\s*\w*\s*)?\(\s*email\s*\)/i,
        message: 'email 에 중복 가입을 막는 제약이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /status\s+VARCHAR\s*\(\s*20\s*\)[^,\n]*DEFAULT\s+'active'/i,
        message: 'status 의 기본값을 \'active\' 로 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:탈퇴|재가입)/,
        message: '탈퇴 회원 재가입 시 문제점을 -- 주석으로 서술해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:NULL)/i,
        message: 'UNIQUE 가 NULL 을 처리하는 방식을 -- 주석으로 서술해야 합니다.'
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
      content: '컬럼 뒤에 `UNIQUE` 를 붙이면 같은 값이 두 번 저장되지 않습니다. 탈퇴 회원의 행이 삭제되지 않고 남아 있다면, 그 이메일은 여전히 테이블 안에 있다는 점을 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- users 테이블을 만들어야 합니다.
- user_id 를 자동 증가하는 기본키로 정의해야 합니다.
- email 에 중복 가입을 막는 제약이 필요합니다.
- status 의 기본값을 'active' 로 지정해야 합니다.
- 탈퇴 회원 재가입 시 문제점을 -- 주석으로 서술해야 합니다.
- UNIQUE 가 NULL 을 처리하는 방식을 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 탈퇴 회원의 행이 status 만 바뀐 채 남아 있으므로, 같은 이메일로 재가입하면 UNIQUE 위반으로 막힙니다.
-- (해결책 예: 탈퇴 시 email 을 비우거나 다른 값으로 바꾸기, 재가입 시 기존 계정을 복구하기)
-- UNIQUE 는 NULL 을 "값이 없음" 으로 보고 서로 같다고 비교하지 않으므로, NULL 인 행은 여러 개 저장될 수 있습니다.
CREATE TABLE users (
  user_id INT          AUTO_INCREMENT PRIMARY KEY,
  email   VARCHAR(255) NOT NULL UNIQUE,
  status  VARCHAR(20)  NOT NULL DEFAULT 'active'
);
`
    }
  ]
}
