import type { CurriculumStep } from '@/types/curriculum'

export const week_2_2_p1: CurriculumStep = {
  id: 'week-2-2-p1',
  title: '1주차 · 연습 ① 기본키와 자동증가 — posts 의 자동 증가 기본키',
  order: 6,
  category: 'schema',
  content: {
    mission:
      '`posts` 테이블을 만들고 `id` 를 `INT AUTO_INCREMENT PRIMARY KEY` 로 정의하세요. (`title VARCHAR(200) NOT NULL` 포함)',
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
      'AUTO_INCREMENT PRIMARY KEY 적용',
      '직전 스텝(기본키와 자동증가)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'posts 의 자동 증가 기본키 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?posts`?\s*\([^;]*?\bid\s+INT[^,]*(AUTO_INCREMENT[^,]*PRIMARY\s+KEY|PRIMARY\s+KEY[^,]*AUTO_INCREMENT)/i,
        message: 'posts.id 를 INT AUTO_INCREMENT PRIMARY KEY 로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?posts`?\s*\([^;]*?\btitle\s+VARCHAR\s*\(\s*200\s*\)[^,]*NOT\s+NULL/i,
        message: 'posts 에 title VARCHAR(200) NOT NULL 이 필요합니다.'
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
      content: '`id INT AUTO_INCREMENT PRIMARY KEY` 와 `title VARCHAR(200) NOT NULL` 을 정의합니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts.id 를 INT AUTO_INCREMENT PRIMARY KEY 로 정의해야 합니다.
- posts 에 title VARCHAR(200) NOT NULL 이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE posts (
  id    INT          AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL
);
`
    }
  ]
}
