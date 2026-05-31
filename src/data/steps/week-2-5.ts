import type { CurriculumStep } from '@/types/curriculum'

export const week_2_5: CurriculumStep = {
  id: 'week-2-5',
  title: '2주차 · 정규화와 N:M 조인 테이블',
  order: 11,
  category: 'relations',
  content: {
    mission:
      '`posts` 와 `tags` 사이의 N:M 관계를 표현하기 위해 `post_tags` 조인 테이블을 만들고 `(post_id, tag_id)` 를 복합 기본키로 지정하세요.',
    theory: `
      ## N:M 관계와 정규화

      "한 글이 여러 태그를 가지고, 한 태그가 여러 글에 붙는" 관계는 N:M 입니다. 관계형 DB 에서는 **조인 테이블** 을 만들어 두 외래키를 모두 보관합니다.

      ## 복합 기본키

      \`\`\`sql
      PRIMARY KEY (post_id, tag_id)
      \`\`\`

      - 두 컬럼이 함께 묶여서 행을 식별합니다.
      - 동일한 (post, tag) 쌍이 중복되지 못하도록 자연스럽게 보장합니다.

      ## 인덱스 전략

      복합 키 \`(post_id, tag_id)\` 는 "어떤 post 의 태그 목록" 조회에는 적합하지만, "어떤 tag 가 붙은 post 목록" 조회는 별도의 \`(tag_id)\` 인덱스나 \`(tag_id, post_id)\` 보조 인덱스로 보완해야 빠릅니다.

      ## 카디널리티 정리

      | 관계 | 표현 방법                                  |
      |------|--------------------------------------------|
      | 1:1  | FK + UNIQUE 또는 같은 PK 공유              |
      | 1:N  | 자식 테이블에 FK 컬럼                      |
      | N:M  | 조인 테이블 + 양쪽으로 FK + 복합 PK        |
    `,
    objectives: [
      'N:M 관계를 조인 테이블로 표현',
      '복합 기본키 정의 방법 학습',
      '양쪽 외래키와 ON DELETE 동작 적용'
    ],
    exercise: `
1. \`tags\` 테이블을 만드세요 (\`id\`, \`name VARCHAR(50) NOT NULL UNIQUE\`).
2. \`post_tags\` 조인 테이블을 만들고 \`post_id\`, \`tag_id\` 두 컬럼에 외래키를 각각 적용하세요.
3. \`PRIMARY KEY (post_id, tag_id)\` 로 복합 기본키를 정의하세요.
    `.trim(),
    expectedOutput: '복합 PK 1, FK 2'
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

-- TODO: tags 테이블을 만드세요.
-- TODO: post_tags 조인 테이블과 복합 PK 를 만드세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?tags`?/i,
        message: 'tags 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?post_tags`?/i,
        message: 'post_tags 조인 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /PRIMARY\s+KEY\s*\(\s*post_id\s*,\s*tag_id\s*\)/i,
        message: '(post_id, tag_id) 복합 기본키가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*post_id\s*\)[\s\S]*REFERENCES\s+`?posts`?\s*\(\s*id\s*\)/i,
        message: 'post_id 외래키 정의가 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /FOREIGN\s+KEY\s*\(\s*tag_id\s*\)[\s\S]*REFERENCES\s+`?tags`?\s*\(\s*id\s*\)/i,
        message: 'tag_id 외래키 정의가 필요합니다.'
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
      content: '복합 기본키는 컬럼 정의 후에 `PRIMARY KEY (a, b)` 로 따로 적습니다.'
    },
    {
      level: 2,
      content: '조인 테이블에는 자체 id 가 필요 없고, 두 외래키만으로 PK 를 구성하는 경우가 많습니다.'
    },
    {
      level: 3,
      content: '정답 SQL 예시입니다.',
      codeSnippet: `CREATE TABLE tags (
  id   INT         AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE post_tags (
  post_id INT NOT NULL,
  tag_id  INT NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
`
    }
  ]
}
