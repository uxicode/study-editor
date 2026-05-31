import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2: CurriculumStep = {
  id: 'week-2-2',
  title: '2주차 · 기본키와 자동증가',
  order: 8,
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
    expectedOutput: 'PK 1, INDEX(자동) 1'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: id 를 AUTO_INCREMENT PRIMARY KEY 로 만들어주세요.
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
