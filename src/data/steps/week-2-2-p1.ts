import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2_p1: CurriculumStep = {
  id: 'week-2-2-p1',
  title: '1주차 · 연습 ① 기본키와 자동증가 — 게시글 번호 자동 발급',
  order: 6,
  category: 'schema',
  content: {
    mission: '커뮤니티 `posts` 테이블에서 글 번호가 자동으로 발급되도록 기본키를 정의하세요.',
    theory: `
      ## 복습: 기본키와 AUTO_INCREMENT

      \`\`\`sql
      id INT AUTO_INCREMENT PRIMARY KEY
      \`\`\`

      - \`PRIMARY KEY\` 는 행을 유일하게 식별하며 NULL 과 중복을 허용하지 않습니다.
      - \`AUTO_INCREMENT\` 는 INSERT 때 자동으로 증가하는 번호를 붙입니다.
      - 삭제된 번호는 다시 쓰지 않고 계속 증가합니다.
    `,
    objectives: [
      'AUTO_INCREMENT 기본키 정의',
      '번호 발급을 DB 에 맡기는 이유 이해',
      '직전 스텝(기본키와 자동증가)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
커뮤니티 게시판에서는 글마다 고유한 번호가 있어야 합니다. 처음에는 서버 코드에서 "현재 가장 큰 번호 + 1" 을 계산해 저장했는데, 사용자가 몰리는 시간에 두 글이 같은 번호를 받는 버그가 보고되었습니다.

**요구사항**
1. \`posts\` 테이블을 만드세요. (포함할 컬럼: \`post_id\`, \`title\`)
2. \`post_id\` 는 새 글이 저장될 때마다 DB 가 자동으로 번호를 매기고, 글을 유일하게 식별하는 키가 되어야 합니다.
3. \`title\` 은 최대 200자입니다.

**생각해 보기** (\`--\` 주석으로 작성)
- 서버 코드에서 "가장 큰 번호 + 1" 로 번호를 만들 때 같은 번호가 생기는 이유와, DB 에 맡기면 해결되는 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '게시글 번호 자동 발급 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'schema.sql',
      path: 'schema.sql',
      language: 'sql',
      content: `-- TODO: 아래에 이 문제의 풀이를 작성하세요.
`
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?posts\s*\(/i,
        message: 'posts 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /post_id\s+(?:INT|BIGINT)(?:\s+UNSIGNED)?\b[^,\n]*(?:AUTO_INCREMENT[^,\n]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,\n]*AUTO_INCREMENT)/i,
        message: 'post_id 를 자동 증가하는 기본키로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /title\s+VARCHAR\s*\(\s*200\s*\)/i,
        message: 'title 은 최대 200자로 제한해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:동시|같은 번호|중복|충돌)/,
        message: '같은 번호가 생기는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '`INT AUTO_INCREMENT PRIMARY KEY` 를 쓰면 DB 가 번호를 매깁니다. 두 요청이 거의 동시에 "가장 큰 번호" 를 읽으면 어떻게 되는지 떠올려 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts 테이블을 만들어야 합니다.
- post_id 를 자동 증가하는 기본키로 정의해야 합니다.
- title 은 최대 200자로 제한해야 합니다.
- 같은 번호가 생기는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 두 요청이 거의 동시에 "가장 큰 번호(10)" 를 읽으면 둘 다 11 을 저장하게 됩니다.
-- AUTO_INCREMENT 는 DB 가 한 번에 하나씩 번호를 발급하므로 같은 번호가 생기지 않습니다.
CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  title   VARCHAR(200)
);
`
    }
  ]
}
