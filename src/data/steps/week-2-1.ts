import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1: CurriculumStep = {
  id: 'week-2-1',
  title: '2주차 · CREATE TABLE 기본',
  order: 7,
  category: 'schema',
  content: {
    mission:
      '`schema.sql` 에 `users` 테이블을 생성하는 `CREATE TABLE` 문을 작성하세요. 컬럼은 `id INT`, `email VARCHAR(255)`, `name VARCHAR(100)` 3개로 시작합니다.',
    theory: `
      ## CREATE TABLE 기본 형식

      \`\`\`sql
      CREATE TABLE users (
        id    INT,
        email VARCHAR(255),
        name  VARCHAR(100)
      );
      \`\`\`

      - 테이블 이름은 영어 소문자 + 복수형 (\`users\`, \`posts\`, \`comments\`) 이 흔합니다.
      - 컬럼 정의는 \`이름 타입 [제약조건]\` 순서로 적습니다.

      ## 자주 쓰는 MySQL 타입

      | 분류  | 타입                       | 용도                |
      |-------|----------------------------|---------------------|
      | 정수  | \`INT\`, \`BIGINT\`        | 일반 / 큰 ID        |
      | 문자  | \`VARCHAR(n)\`, \`TEXT\`   | 가변 / 긴 텍스트    |
      | 시각  | \`DATETIME\`, \`TIMESTAMP\` | 시점 저장          |
      | 불리언| \`TINYINT(1)\` 또는 \`BOOLEAN\` | 참/거짓         |

      ## 다음 스텝의 예고
      지금 단계에서는 제약조건 없이 가장 작은 형태로 시작합니다. 다음 스텝부터 \`PRIMARY KEY\`, \`AUTO_INCREMENT\`, \`NOT NULL\` 을 더해갑니다.
    `,
    objectives: [
      'CREATE TABLE 의 기본 구문 이해',
      'MySQL 의 기본 데이터 타입 익히기',
      '컬럼 정의 순서와 세미콜론 종결자 이해'
    ],
    exercise: `
1. \`schema.sql\` 에 \`CREATE TABLE users\` 문을 작성하세요.
2. 컬럼 3개 (\`id INT\`, \`email VARCHAR(255)\`, \`name VARCHAR(100)\`) 를 정의하세요.
3. SQL 분석기가 "생성된 테이블 1개" 를 보고하면 성공입니다.
    `.trim(),
    expectedOutput: '생성된 테이블: users'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: users 테이블을 생성하세요.
-- 컬럼: id INT, email VARCHAR(255), name VARCHAR(100)
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?users`?/i,
        message: 'users 테이블을 생성하는 CREATE TABLE 문이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bid\s+INT\b/i,
        message: 'id INT 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bemail\s+VARCHAR\s*\(\s*255\s*\)/i,
        message: 'email VARCHAR(255) 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bname\s+VARCHAR\s*\(\s*100\s*\)/i,
        message: 'name VARCHAR(100) 컬럼이 필요합니다.'
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
      content: 'MySQL 의 CREATE TABLE 은 `CREATE TABLE 테이블이름 ( 컬럼정의들 );` 형식입니다.'
    },
    {
      level: 2,
      content: '컬럼은 쉼표로 구분하고, 마지막 컬럼 뒤에는 쉼표를 붙이지 않습니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id    INT,
  email VARCHAR(255),
  name  VARCHAR(100)
);
`
    }
  ]
}
