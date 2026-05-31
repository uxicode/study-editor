import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4: CurriculumStep = {
  id: 'week-2-4',
  title: '2주차 · 외래키와 1:N 관계',
  order: 10,
  category: 'relations',
  content: {
    mission:
      '`posts` 테이블을 만들고 `user_id INT NOT NULL` 컬럼을 추가한 뒤, `users(id)` 를 참조하는 외래키 제약 (`ON DELETE CASCADE`) 을 작성하세요.',
    theory: `
      ## 외래키 (FOREIGN KEY)

      한 테이블의 컬럼이 **다른 테이블의 기본키** 를 참조한다는 제약입니다.

      \`\`\`sql
      FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
      \`\`\`

      ## 참조 동작 (ON DELETE)

      | 동작        | 의미                                          |
      |-------------|-----------------------------------------------|
      | CASCADE     | 부모가 지워지면 자식도 함께 삭제              |
      | SET NULL    | 부모가 지워지면 자식의 FK 컬럼이 NULL 로 변함 |
      | RESTRICT    | 자식이 존재하면 부모 삭제를 막음              |
      | NO ACTION   | RESTRICT 와 거의 동일 (기본값)                |

      ## 1:N 관계의 표현

      "한 명의 사용자가 여러 글을 가진다" 는 1:N 관계를 자식 테이블의 FK 컬럼으로 표현합니다.

      ## 인덱스
      MySQL 에서 FK 가 걸린 컬럼에는 자동 인덱스가 생성되므로 별도 \`CREATE INDEX\` 가 필수는 아닙니다.
    `,
    objectives: [
      'FOREIGN KEY 의 구문 학습',
      'REFERENCES 와 ON DELETE 옵션 의미',
      '1:N 관계를 스키마로 표현하기'
    ],
    exercise: `
1. \`posts\` 테이블을 새로 만드세요.
   - \`id INT AUTO_INCREMENT PRIMARY KEY\`
   - \`user_id INT NOT NULL\`
   - \`title VARCHAR(255) NOT NULL\`
   - \`content TEXT\`
2. 테이블 정의 마지막에 \`FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE\` 를 추가하세요.
    `.trim(),
    expectedOutput: 'FK 1, ON DELETE 1'
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

-- TODO: posts 테이블을 만들고 users(id) 를 참조하는 FOREIGN KEY 를 추가하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?posts`?/i,
        message: 'posts 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*user_id\s*\)/i,
        message: 'FOREIGN KEY (user_id) 정의가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /REFERENCES\s+`?users`?\s*\(\s*id\s*\)/i,
        message: 'REFERENCES users(id) 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /ON\s+DELETE\s+CASCADE/i,
        message: 'ON DELETE CASCADE 동작을 명시해야 합니다.'
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
      content: 'FK 는 컬럼 정의 마지막에 `FOREIGN KEY (자식컬럼) REFERENCES 부모테이블(부모컬럼)` 형태로 적습니다.'
    },
    {
      level: 2,
      content: '`ON DELETE CASCADE` 는 부모가 지워질 때 자식도 자동 삭제됩니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE users (
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
`
    }
  ]
}
