import type { CurriculumStep } from '@/types/curriculum'

export const week_2_4: CurriculumStep = {
  id: 'week-2-4',
  title: '1주차 · 외래키와 1:N 관계',
  order: 4,
  category: 'relations',
  content: {
    mission:
      '`posts` 테이블을 만들고 `user_id INT NOT NULL` 컬럼을 추가한 뒤, `users(id)` 를 참조하는 외래키 제약 (`ON DELETE CASCADE`) 을 작성하세요.',
    theory: `
      ## 왜 외래키가 필요한가?

      \`posts.user_id\` 에 그냥 숫자만 적어두면, 존재하지 않는 사용자의 글(**고아 데이터**)이 쉽게 생깁니다.
      **외래키(FOREIGN KEY)** 는 "이 컬럼의 값은 다른 테이블의 기본키에 실제로 존재해야 한다" 를 **DB 가 직접 보장**하게 만드는 제약입니다.

      ## 1:N 관계란?

      "한 명의 사용자(1)가 여러 개의 글(N)을 쓴다" 처럼, 한쪽 행 하나가 다른 쪽 행 여러 개와 연결되는 관계입니다.
      **FK 는 항상 'N' 쪽(자식) 테이블에 둡니다.**

      \`\`\`
      users (부모, 1)            posts (자식, N)
      ┌────┬───────────┐         ┌────┬─────────┬────────────┐
      │ id │ name      │         │ id │ user_id │ title      │
      ├────┼───────────┤         ├────┼─────────┼────────────┤
      │ 1  │ 김철수    │ ◀──┬─── │ 1  │ 1       │ 첫 글      │
      │ 2  │ 이영희    │ ◀──┤─── │ 2  │ 1       │ 두 번째 글 │
      └────┴───────────┘    │     │ 3  │ 2       │ 안녕하세요 │
                            └──── └────┴─────────┴────────────┘
      \`\`\`

      - 김철수(id=1) 는 글 2개, 이영희(id=2) 는 글 1개를 가집니다.
      - 반대로 "글 하나의 작성자" 는 항상 한 명뿐입니다. (그래서 1:N)
      - 부모 쪽(\`users\`) 에는 아무 변경도 필요 없습니다. 관계 정보는 자식의 \`user_id\` 하나에만 담깁니다.

      ## 외래키 선언 문법

      \`\`\`sql
      CREATE TABLE posts (
        id      INT          AUTO_INCREMENT PRIMARY KEY,
        user_id INT          NOT NULL,
        title   VARCHAR(255) NOT NULL,
        content TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
      );
      \`\`\`

      | 부분                          | 의미                                       |
      |-------------------------------|--------------------------------------------|
      | \`FOREIGN KEY (user_id)\`       | 자식 테이블에서 참조를 거는 컬럼           |
      | \`REFERENCES users(id)\`        | 부모 테이블과 **기본키(또는 UNIQUE)** 컬럼 |
      | \`ON DELETE ...\`               | 부모 행이 삭제될 때 자식을 어떻게 할지     |
      | \`ON UPDATE ...\`               | 부모의 키 값이 바뀔 때 자식을 어떻게 할지  |

      이름을 직접 붙이고 싶다면 \`CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id)\` 로 적습니다.
      (에러 메시지에 이름이 나와서 디버깅이 쉬워집니다.)

      ## FK 가 막아주는 것

      \`\`\`sql
      INSERT INTO users (email, name) VALUES ('a@a.com', '김철수');  -- id = 1

      INSERT INTO posts (user_id, title) VALUES (1, '첫 글');        -- OK
      INSERT INTO posts (user_id, title) VALUES (99, '유령 글');     -- ERROR 1452
      -- Cannot add or update a child row: a foreign key constraint fails
      \`\`\`

      \`users\` 에 id=99 가 없으므로 INSERT 자체가 거부됩니다. 반대 방향도 막힙니다.

      \`\`\`sql
      DELETE FROM users WHERE id = 1;
      -- ON DELETE 옵션이 없거나 RESTRICT 라면 ERROR 1451 (자식 글이 남아 있으므로 삭제 불가)
      \`\`\`

      ## 참조 동작 (ON DELETE) 비교

      \`users\` 에서 id=1 을 삭제했을 때, 그 사용자의 글 2개는 어떻게 될까요?

      | 동작        | 결과                                              | 어울리는 경우                    |
      |-------------|---------------------------------------------------|----------------------------------|
      | CASCADE     | 글 2개도 **함께 삭제**                            | 부모 없이는 의미 없는 데이터 (주문 항목, 게시글 첨부) |
      | SET NULL    | 글은 남고 \`user_id\` 가 **NULL** 로 변경           | 작성자가 사라져도 기록은 보존 (단, 컬럼이 NULL 허용이어야 함) |
      | RESTRICT    | 글이 있으면 사용자 **삭제 자체를 거부**           | 실수로 지우면 안 되는 핵심 데이터 |
      | NO ACTION   | MySQL(InnoDB) 에서는 RESTRICT 와 동일 (기본값)    | -                                |

      > \`SET NULL\` 을 쓰려면 \`user_id\` 에 \`NOT NULL\` 을 붙이면 안 됩니다. 이번 실습은 \`NOT NULL\` + \`CASCADE\` 조합입니다.

      ## 관계 조회: JOIN 맛보기

      \`\`\`sql
      SELECT u.name, p.title
      FROM posts p
      JOIN users u ON u.id = p.user_id;
      \`\`\`

      FK 로 연결해 둔 덕분에 \`u.id = p.user_id\` 한 줄로 두 테이블을 이을 수 있습니다. (JOIN 은 Step 6 에서 자세히 다룹니다.)

      ## 자주 하는 실수

      - **타입 불일치**: \`users.id\` 가 \`INT\` 면 \`posts.user_id\` 도 \`INT\` 여야 합니다. (\`BIGINT\` vs \`INT\`, \`UNSIGNED\` 여부까지 같아야 함)
      - **테이블 생성 순서**: 부모(\`users\`) 를 먼저 만들어야 자식(\`posts\`) 이 참조할 수 있습니다.
      - **FK 를 부모 쪽에 둠**: "1" 쪽이 아니라 **"N" 쪽 테이블**에 FK 컬럼이 있어야 합니다.
      - **FK 컬럼 NOT NULL 여부**: 모든 글에 작성자가 반드시 있어야 하면 \`NOT NULL\`, 선택적 관계면 NULL 허용.

      ## 인덱스
      MySQL(InnoDB) 은 FK 컬럼에 자동으로 인덱스를 만들어 주므로 JOIN 성능을 위해 별도 \`CREATE INDEX\` 가 필수는 아닙니다.
    `,
    objectives: [
      '외래키가 막아주는 문제(고아 데이터) 이해하기',
      'FOREIGN KEY / REFERENCES 구문으로 1:N 관계 표현하기',
      'FK 는 "N" 쪽 테이블에 둔다는 원칙 익히기',
      'ON DELETE CASCADE / SET NULL / RESTRICT 의 차이 구분하기'
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
      content: '`ON DELETE CASCADE` 는 부모가 지워질 때 자식도 자동 삭제됩니다. `user_id` 타입은 `users.id` 와 같은 `INT` 여야 하고, FK 는 "N" 쪽인 `posts` 에 둡니다.'
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
