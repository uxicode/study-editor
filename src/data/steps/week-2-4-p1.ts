import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p1: CurriculumStep = {
  id: 'week-2-4-p1',
  title: '1주차 · 연습 ① 외래키와 1:N 관계 — 이름 붙인 외래키',
  order: 14,
  category: 'relations',
  content: {
    mission:
      '`comments` 테이블을 만들고 `post_id INT NOT NULL` 이 `posts(id)` 를 참조하도록 `CONSTRAINT fk_comments_post FOREIGN KEY ... ON DELETE CASCADE` 형태로 이름을 붙여 정의하세요. (`content TEXT NOT NULL` 포함)',
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
      'CONSTRAINT 로 FK 에 이름 붙이기',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '이름 붙인 외래키 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?comments`?\s*\(/i,
        message: 'comments 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CONSTRAINT\s+fk_comments_post\s+FOREIGN\s+KEY\s*\(\s*post_id\s*\)\s*REFERENCES\s+`?posts`?\s*\(\s*id\s*\)[^,;]*ON\s+DELETE\s+CASCADE/i,
        message: 'CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE 가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bcontent\s+TEXT\s+NOT\s+NULL/i,
        message: 'content TEXT NOT NULL 이 필요합니다.'
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
      content: '`CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE` 를 테이블 정의 끝에 둡니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- comments 테이블을 생성해야 합니다.
- CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE 가 필요합니다.
- content TEXT NOT NULL 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE comments (
  id      INT  AUTO_INCREMENT PRIMARY KEY,
  post_id INT  NOT NULL,
  content TEXT NOT NULL,
  CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);
`
    }
  ]
}
