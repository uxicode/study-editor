import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p3: CurriculumStep = {
  id: 'week-2-4-p3',
  title: '1주차 · 연습 ③ 외래키와 1:N 관계 — 삭제 동작 비교와 에러 번호',
  order: 16,
  category: 'relations',
  content: {
    mission:
      '`users.id = 1` 을 삭제했을 때 `CASCADE` / `SET NULL` / `RESTRICT` 각각에서 `posts` 에 어떤 일이 생기는지 주석 3줄로 정리하고(각 키워드 포함), 존재하지 않는 `user_id = 999` 로 `INSERT` 하면 나는 에러 번호 `1452` 도 주석에 적으세요.',
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
      'CASCADE / SET NULL / RESTRICT 의 차이 설명',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    expectedOutput: '삭제 동작 비교와 에러 번호 — 모든 채점 항목 통과'
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
        pattern: /--[^\n]*CASCADE/i,
        message: 'CASCADE 동작을 -- 주석으로 설명해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*RESTRICT/i,
        message: 'RESTRICT 동작을 -- 주석으로 설명해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*1452/,
        message: 'user_id = 999 INSERT 시 에러 번호 1452 를 -- 주석으로 적어야 합니다.'
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
      content: '`--` 주석 3줄에 각각 CASCADE, SET NULL, RESTRICT 를 설명하고, 마지막 줄에 존재하지 않는 부모 INSERT 시 에러 번호(1452)를 적으세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- CASCADE 동작을 -- 주석으로 설명해야 합니다.
- RESTRICT 동작을 -- 주석으로 설명해야 합니다.
- user_id = 999 INSERT 시 에러 번호 1452 를 -- 주석으로 적어야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- users.id = 1 삭제 시:
-- CASCADE : posts 의 해당 사용자 글도 함께 삭제
-- SET NULL: posts.user_id 가 NULL 로 변경
-- RESTRICT: 글이 남아 있으면 사용자 삭제가 거부됨
-- user_id = 999 로 INSERT 하면 부모가 없어 ERROR 1452 (foreign key constraint fails)
`
    }
  ]
}
