import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4_p2: CurriculumStep = {
  id: 'week-2-4-p2',
  title: '1주차 · 연습 ② 외래키와 1:N 관계 — 탈퇴해도 남아야 하는 글',
  order: 15,
  category: 'relations',
  content: {
    mission: '작성자가 탈퇴해도 글은 남고 작성자 정보만 비워지도록 `posts_archive` 테이블의 외래키를 정의하세요.',
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
      'ON DELETE SET NULL 이 어울리는 경우 이해',
      'FK 컬럼의 NULL 허용 여부 판단',
      '직전 스텝(외래키와 1:N 관계)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
Q&A 서비스에서 답변이 채택된 글은 다른 사용자에게도 중요한 자료입니다. 그래서 작성자가 탈퇴해도 글은 지우지 않고, 화면에는 작성자를 "(탈퇴한 사용자)" 로 표시하기로 했습니다.

**요구사항**
1. 위의 \`users\` 아래에 \`posts_archive\` 테이블을 만드세요. (포함할 컬럼: \`id\`, \`user_id\`, \`title\`)
2. \`id\` 는 자동 증가하는 기본키, \`title\` 은 필수이며 최대 255자입니다.
3. \`user_id\` 는 \`users(id)\` 를 참조하고, 작성자가 탈퇴(삭제)되면 글은 남고 \`user_id\` 만 비워지게 하세요.

**생각해 보기** (\`--\` 주석으로 작성)
- \`user_id\` 에 \`NOT NULL\` 을 붙이면 이 요구사항이 왜 동작하지 않는지 서술해 주세요.
- 화면에서 "(탈퇴한 사용자)" 를 표시하려면 어떤 값을 기준으로 판단하면 되는지 적어 주세요.
    `.trim(),
    expectedOutput: '탈퇴해도 남아야 하는 글 — 모든 채점 항목 통과'
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

-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?posts_archive\s*\(/i,
        message: 'posts_archive 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+posts_archive\s*\([^;]*user_id\s+INT\b(?![^,\n]*NOT\s+NULL)/i,
        message: 'user_id 는 비워질 수 있어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+posts_archive\s*\([^;]*title\s+VARCHAR\s*\(\s*255\s*\)[^,\n]*NOT\s+NULL/i,
        message: 'title 은 필수이며 최대 255자여야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+posts_archive\s*\([^;]*FOREIGN\s+KEY\s*\(\s*user_id\s*\)\s*REFERENCES\s+users\s*\(\s*id\s*\)\s*ON\s+DELETE\s+SET\s+NULL/i,
        message: '작성자가 삭제되면 user_id 만 비워지도록 외래키를 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:NOT NULL)/i,
        message: 'NOT NULL 을 붙이면 안 되는 이유를 -- 주석으로 서술해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:탈퇴한 사용자|NULL 이면|NULL인|NULL 인)/i,
        message: '탈퇴한 사용자를 판단하는 기준을 -- 주석으로 서술해야 합니다.'
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
      content: '부모가 삭제될 때 자식의 FK 를 `NULL` 로 바꾸는 동작은 `ON DELETE SET NULL` 입니다. NULL 로 바꾸려면 그 컬럼이 NULL 을 허용해야 합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts_archive 테이블을 만들어야 합니다.
- user_id 는 비워질 수 있어야 합니다.
- title 은 필수이며 최대 255자여야 합니다.
- 작성자가 삭제되면 user_id 만 비워지도록 외래키를 정의해야 합니다.
- NOT NULL 을 붙이면 안 되는 이유를 -- 주석으로 서술해야 합니다.
- 탈퇴한 사용자를 판단하는 기준을 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE users (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name  VARCHAR(100) NOT NULL
);

-- SET NULL 은 user_id 를 NULL 로 바꾸는 동작이라, NOT NULL 이면 바꿀 수 없어 사용자 삭제 자체가 실패합니다.
-- 화면에서는 user_id 가 NULL 인 글을 "(탈퇴한 사용자)" 로 표시하면 됩니다.
CREATE TABLE posts_archive (
  id      INT          AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title   VARCHAR(255) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
`
    }
  ]
}
