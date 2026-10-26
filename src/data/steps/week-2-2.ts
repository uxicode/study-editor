import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2: CurriculumStep = {
  id: 'week-2-2',
  title: '1주차 · 기본키와 자동증가',
  order: 5,
  category: 'schema',
  content: {
    mission:
      '`users` 테이블의 `id` 컬럼을 `INT AUTO_INCREMENT PRIMARY KEY` 로 만들어 자동 증가하는 기본키로 사용하세요.',
    theory: `
      ## PRIMARY KEY

      한 행을 **유일하게 식별**하는 컬럼(들) 입니다.

      - 기본키는 자동으로 \`NOT NULL\` 이며 \`UNIQUE\` 제약을 가집니다.
      - 인덱스가 자동으로 생성되어 조회가 빠릅니다.

      ## AUTO_INCREMENT

      MySQL 의 자동 증가 컬럼 키워드입니다 (PostgreSQL 의 \`SERIAL\` 과 동일한 역할).

      \`\`\`sql
      id INT AUTO_INCREMENT PRIMARY KEY
      \`\`\`

      - 새 행이 추가될 때마다 1, 2, 3 … 으로 자동 증가
      - 명시적으로 \`INSERT\` 시 컬럼 목록에 \`id\` 를 빼면 자동으로 채워짐

      ## id 컬럼의 타입은 무엇이 좋을까?

      자동 증가 번호는 계속 커지기만 하므로(지운 번호도 다시 쓰지 않습니다) **타입이 담을 수 있는 최댓값**을 알아 두어야 합니다.

      | 타입 | 최댓값(양수) | 이럴 때 |
      |------|--------------|---------|
      | \`INT\` | 2,147,483,647 (약 21억) | 대부분의 서비스. 이 커리큘럼의 기본 선택 |
      | \`INT UNSIGNED\` | 4,294,967,295 (약 42억) | id 는 음수가 없으므로 두 배 범위를 쓸 때 |
      | \`BIGINT\` | 약 922경 | 로그·결제처럼 수십억 건 이상 쌓일 수 있을 때 |

      최댓값까지 가득 차면 새 행을 넣을 때 에러가 납니다. 나중에 타입을 바꾸는 일은 매우 어려우므로, 대규모 데이터가 예상되면 처음부터 \`BIGINT\` 를 고려하세요.

      ## 복합 기본키

      여러 컬럼을 묶어 기본키로 사용할 수도 있습니다.

      \`\`\`sql
      PRIMARY KEY (user_id, role_id)
      \`\`\`
    `,
    objectives: [
      'PRIMARY KEY 의 역할 이해',
      'AUTO_INCREMENT 사용법 학습',
      '기본키가 자동 인덱스로 동작함을 인지'
    ],
    exercise: `
1. 기존 \`id INT\` 정의를 \`id INT AUTO_INCREMENT PRIMARY KEY\` 로 변경하세요.
2. SQL 분석기 로그에 "PRIMARY KEY 1" 과 "AUTO_INCREMENT 1" 이 함께 나오면 성공입니다.
    `.trim(),
    expectedOutput: '제약/인덱스: PK 1 (로그: PRIMARY KEY 1, AUTO_INCREMENT 1)',
    localPractice: `\`study\` DB 에서 \`users\` 를 다시 만든 뒤 (\`DROP TABLE IF EXISTS users;\`) 실행해 보세요.

\`\`\`sql
INSERT INTO users (email, name) VALUES ('a@test.com', 'A'), ('b@test.com', 'B');
SELECT LAST_INSERT_ID();
DELETE FROM users WHERE id = 2;
INSERT INTO users (email, name) VALUES ('c@test.com', 'C');
SELECT * FROM users;
\`\`\`

- 지운 \`id = 2\` 가 다시 쓰이지 않고 \`3\` 이 되는 것을 확인하세요. \`SHOW CREATE TABLE users;\` 끝의 \`AUTO_INCREMENT=\` 값도 보세요.
- \`INSERT INTO users (id, email, name) VALUES (1, 'x@test.com', 'X');\` 는 \`ERROR 1062\` (중복 기본키) 입니다.

**타입 최댓값 체험**

\`\`\`sql
CREATE TABLE tiny_test (id TINYINT AUTO_INCREMENT PRIMARY KEY);
INSERT INTO tiny_test VALUES (127);
INSERT INTO tiny_test VALUES (NULL);  -- ERROR 1062: Duplicate entry '127'
DROP TABLE tiny_test;
\`\`\`

자동 증가 값이 타입의 최댓값에 도달하면 이런 에러가 납니다. \`INT\` 와 \`BIGINT\` 선택이 중요한 이유입니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: id 를 자동 증가하는 기본키로 만들어주세요.
CREATE TABLE users (
  id    INT,
  email VARCHAR(255),
  name  VARCHAR(100)
);
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /AUTO_INCREMENT/i,
        message: 'AUTO_INCREMENT 키워드가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY/i,
        message: 'PRIMARY KEY 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /id\s+INT[^,]*AUTO_INCREMENT[^,]*PRIMARY\s+KEY|id\s+INT[^,]*PRIMARY\s+KEY[^,]*AUTO_INCREMENT/i,
        message: 'id 컬럼이 AUTO_INCREMENT 와 PRIMARY KEY 를 모두 가져야 합니다.'
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
      content: '`AUTO_INCREMENT` 와 `PRIMARY KEY` 를 같은 컬럼 정의 줄에 함께 적습니다.'
    },
    {
      level: 2,
      content: '`id INT AUTO_INCREMENT PRIMARY KEY` 와 같이 한 줄로 표현 가능합니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  name  VARCHAR(100)
);
`
    }
  ]
}
