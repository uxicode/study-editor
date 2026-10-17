import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p1: CurriculumStep = {
  id: 'week-2-1-p1',
  title: '1주차 · 연습 ① CREATE TABLE 기본 — posts 테이블 만들기',
  order: 2,
  category: 'schema',
  content: {
    mission:
      '`posts` 테이블을 만드세요. 컬럼은 `id INT`, `title VARCHAR(200)`, `content TEXT` 입니다.',
    theory: `
      ## 복습: CREATE TABLE

      \`\`\`sql
      CREATE TABLE 테이블명 (
        컬럼명 타입,
        컬럼명 타입
      );
      \`\`\`

      - 문자열: \`VARCHAR(길이)\`, 긴 글: \`TEXT\`, 정수: \`INT\`
      - 돈처럼 오차가 있으면 안 되는 소수: \`DECIMAL(전체자릿수, 소수자릿수)\`
      - 시각: \`DATETIME\`
      - SQL 주석은 \`--\` 로 시작합니다.
    `,
    objectives: [
      'CREATE TABLE 로 3개 컬럼을 가진 테이블 정의',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'posts 테이블 만들기 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?posts`?\s*\(/i,
        message: 'posts 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\btitle\s+VARCHAR\s*\(\s*200\s*\)/i,
        message: 'title VARCHAR(200) 컬럼이 필요합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /\bcontent\s+TEXT\b/i,
        message: 'content TEXT 컬럼이 필요합니다.'
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
      content: '`CREATE TABLE posts ( id INT, title VARCHAR(200), content TEXT );` 형태입니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts 테이블을 생성해야 합니다.
- title VARCHAR(200) 컬럼이 필요합니다.
- content TEXT 컬럼이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE posts (
  id      INT,
  title   VARCHAR(200),
  content TEXT
);
`
    }
  ]
}
