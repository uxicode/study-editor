import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p2: CurriculumStep = {
  id: 'week-2-1-p2',
  title: '1주차 · 연습 ② CREATE TABLE 기본 — tags 테이블 만들기',
  order: 3,
  category: 'schema',
  content: {
    mission:
      '`tags` 테이블을 만드세요. 컬럼은 `id INT`, `name VARCHAR(50)` 입니다.',
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
      'VARCHAR 길이 지정 연습',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    expectedOutput: 'tags 테이블 만들기 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+`?tags`?\s*\(/i,
        message: 'tags 테이블을 생성해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /CREATE\s+TABLE\s+`?tags`?\s*\([^;]*?\bname\s+VARCHAR\s*\(\s*50\s*\)/i,
        message: 'tags 에 name VARCHAR(50) 컬럼이 필요합니다.'
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
      content: '`name VARCHAR(50)` 처럼 괄호 안에 최대 길이를 적습니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- tags 테이블을 생성해야 합니다.
- tags 에 name VARCHAR(50) 컬럼이 필요합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `CREATE TABLE tags (
  id   INT,
  name VARCHAR(50)
);
`
    }
  ]
}
