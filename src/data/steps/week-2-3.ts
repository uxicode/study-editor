import type { CurriculumStep } from '@/types/curriculum'

export const week_2_3: CurriculumStep = {
  id: 'week-2-3',
  title: '1주차 · 제약조건 (NOT NULL · UNIQUE · DEFAULT · CHECK)',
  order: 9,
  category: 'schema',
  content: {
    mission:
      '`users` 테이블에 데이터 무결성 제약조건을 추가하세요. `email` 은 `NOT NULL UNIQUE`, `name` 은 `NOT NULL`, `role` 컬럼에 `DEFAULT \'user\'`, `age` 에 `CHECK (age >= 0)` 을 적용합니다.',
    theory: `
      데이터베이스의 가장 큰 가치는 **데이터 무결성**입니다.

      ## 핵심 제약조건

      | 제약조건   | 의미                              |
      |-----------|-----------------------------------|
      | NOT NULL   | NULL 을 허용하지 않음            |
      | UNIQUE     | 컬럼 값이 테이블 내 유일해야 함   |
      | DEFAULT v  | 값을 지정하지 않으면 기본값 v     |
      | CHECK (…)  | 조건을 만족해야만 INSERT/UPDATE 허용 |

      ## 예시

      \`\`\`sql
      email VARCHAR(255) NOT NULL UNIQUE,
      role  VARCHAR(20)  NOT NULL DEFAULT 'user',
      age   INT          CHECK (age >= 0)
      \`\`\`

      - \`NOT NULL\` 은 응용단의 \`required\` 와 짝을 이루어야 신뢰할 수 있습니다.
      - \`UNIQUE\` 도 자동 인덱스를 생성합니다.
      - \`DEFAULT\` 를 잘 쓰면 \`INSERT\` 문을 간결하게 작성할 수 있습니다.
    `,
    objectives: [
      'NOT NULL / UNIQUE 의 차이 이해',
      'DEFAULT 절 사용법 익히기',
      'CHECK 절로 도메인 제약 표현'
    ],
    exercise: `
1. \`email\` 컬럼에 \`NOT NULL\` 과 \`UNIQUE\` 를 모두 적용하세요.
2. \`name\` 컬럼은 \`NOT NULL\` 만 적용하세요.
3. \`role VARCHAR(20) NOT NULL DEFAULT 'user'\` 컬럼을 추가하세요.
4. \`age INT CHECK (age >= 0)\` 컬럼을 추가하세요.
    `.trim(),
    expectedOutput: 'NOT NULL ≥ 3, UNIQUE ≥ 1, DEFAULT ≥ 1, CHECK ≥ 1',
    localPractice: `\`users\` 를 이 스텝의 정의로 다시 만든 뒤, 제약을 하나씩 위반해 보세요.

\`\`\`sql
INSERT INTO users (email, name) VALUES ('a@test.com', 'A');

INSERT INTO users (email, name) VALUES ('a@test.com', 'B');   -- UNIQUE 위반
INSERT INTO users (email, name) VALUES ('b@test.com', NULL);  -- NOT NULL 위반
INSERT INTO users (email) VALUES ('c@test.com');              -- name 누락
INSERT INTO users (email, name, age) VALUES ('d@test.com', 'D', -1);  -- CHECK 위반
\`\`\`

| 상황 | 에러 |
|------|------|
| UNIQUE 위반 | \`ERROR 1062 (23000)\` |
| 명시적 NULL | \`ERROR 1048 (23000)\` |
| 기본값 없는 NOT NULL 컬럼 누락 | \`ERROR 1364 (HY000)\` |
| CHECK 위반 | \`ERROR 3819 (HY000)\` |

- 성공한 행의 \`role\` 이 \`'user'\` 로 채워졌는지 \`SELECT * FROM users;\` 로 확인하세요.
- **관찰 포인트:** \`CHECK\` 는 MySQL 8.0.16 이상에서만 실제로 적용됩니다. \`SELECT VERSION();\` 으로 버전을 확인하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `CREATE TABLE users (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  name  VARCHAR(100)
);
-- TODO: 위 정의에 필수값 · 유일값 · 기본값 · 조건 검사 제약을 추가하고
--       role 과 age 컬럼을 새로 만드세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /email[^,]*NOT\s+NULL/i,
        message: 'email 컬럼에 NOT NULL 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /email[^,]*UNIQUE|UNIQUE[^,]*\(\s*email\s*\)/i,
        message: 'email 컬럼에 UNIQUE 제약이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bname\s+VARCHAR\s*\(\s*100\s*\)[^,]*NOT\s+NULL/i,
        message: 'name 컬럼에 NOT NULL 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\brole\s+VARCHAR\s*\(\s*20\s*\)[^,]*DEFAULT\s+'user'/i,
        message: "role VARCHAR(20) 컬럼에 DEFAULT 'user' 가 필요합니다."
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bCHECK\s*\(\s*age\s*>=\s*0\s*\)/i,
        message: 'age 컬럼에 CHECK (age >= 0) 제약이 필요합니다.'
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
      content: '하나의 컬럼에 여러 제약을 띄어쓰기로 나열할 수 있습니다: `email VARCHAR(255) NOT NULL UNIQUE`'
    },
    {
      level: 2,
      content: '`CHECK (age >= 0)` 처럼 컬럼 정의 마지막에 CHECK 절을 붙이거나 테이블 레벨로 따로 작성할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL,
  role  VARCHAR(20)  NOT NULL DEFAULT 'user',
  age   INT          CHECK (age >= 0)
);
`
    }
  ]
}
