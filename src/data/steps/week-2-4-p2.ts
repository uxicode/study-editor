import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p2: CurriculumStep = {
  id: 'week-2-4-p2',
  title: '1주차 · 연습 ② 외래키와 1:N 관계 — ON DELETE SET NULL',
  order: 15,
  category: 'relations',
  content: {
    mission:
      '`posts_archive` 테이블을 만들되 `user_id INT NULL` 로 두고 `ON DELETE SET NULL` 을 적용하세요. 작성자가 탈퇴해도 글은 남기는 요구사항입니다. `NOT NULL` 을 붙이면 안 되는 이유를 `NOT NULL` 이라는 표현을 넣어 주석으로 적으세요.',
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
      'SET NULL 과 NULL 허용 컬럼의 관계 이해',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'ON DELETE SET NULL — 모든 채점 항목 통과'
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

CREATE TABLE posts (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  user_id INT          NOT NULL,
  title   VARCHAR(255) NOT NULL,
  content TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
        pattern: /CREATE\s+TABLE\s+`?posts_archive`?\s*\([^;]*?\buser_id\s+INT\s+NULL/i,
        message: 'posts_archive.user_id 는 INT NULL 이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /ON\s+DELETE\s+SET\s+NULL/i,
        message: 'ON DELETE SET NULL 이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*NOT\s+NULL/i,
        message: 'NOT NULL 을 붙이면 안 되는 이유를 -- 주석으로 적어야 합니다.'
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
      content: '`user_id INT NULL` 로 두고 `ON DELETE SET NULL` 을 적용합니다. 주석에 `NOT NULL` 을 붙이면 안 되는 이유를 쓰세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts_archive.user_id 는 INT NULL 이어야 합니다.
- ON DELETE SET NULL 이 필요합니다.
- NOT NULL 을 붙이면 안 되는 이유를 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- SET NULL 은 컬럼이 NULL 을 허용해야 동작하므로 NOT NULL 을 붙이면 안 됩니다.
CREATE TABLE posts_archive (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  user_id INT          NULL,
  title   VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
`
    }
  ]
}
