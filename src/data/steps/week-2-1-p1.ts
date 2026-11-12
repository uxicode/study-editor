import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p1: CurriculumStep = {
  id: 'week-2-1-p1',
  title: '1주차 · 연습 ① CREATE TABLE 기본 — 블로그 글 저장 테이블',
  order: 2,
  category: 'schema',
  content: {
    mission: '블로그 서비스의 글을 저장할 `posts` 테이블을 만들고, 각 컬럼에 알맞은 타입을 고르세요.',
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
      '데이터 성격에 맞는 문자열 타입(VARCHAR / TEXT) 고르기',
      '날짜·시간 타입 고르기',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
개인 블로그 서비스를 만들고 있습니다. 글 목록 화면에는 제목만, 상세 화면에는 본문 전체가 보입니다. 본문은 짧게는 몇 줄, 길게는 수만 자까지 쓰입니다.

**요구사항**
1. 글을 저장하는 \`posts\` 테이블을 만드세요. (포함할 컬럼: \`post_id\`, \`title\`, \`body\`, \`published_at\`)
2. \`post_id\` 는 정수, \`title\` 은 최대 200자로 제한하세요.
3. \`body\` 는 길이를 미리 정하기 어려운 긴 글에 맞는 타입을 고르세요.
4. \`published_at\` 에는 발행한 날짜와 시각을 함께 저장합니다.

**생각해 보기** (\`--\` 주석으로 작성)
- \`title\` 과 \`body\` 에 서로 다른 문자열 타입을 고른 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '블로그 글 저장 테이블 — 모든 채점 항목 통과'
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
        pattern: /post_id\s+(?:INT|BIGINT)/i,
        message: 'post_id 는 정수 타입이어야 합니다.'
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
        pattern: /body\s+(?:MEDIUM|LONG)?TEXT\b/i,
        message: 'body 에 긴 글에 맞는 타입을 골라야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /published_at\s+(?:DATETIME|TIMESTAMP)\b/i,
        message: 'published_at 은 날짜와 시각을 함께 담는 타입이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:TEXT|VARCHAR)/i,
        message: '두 문자열 타입을 고른 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '짧고 길이 상한이 분명한 값은 `VARCHAR(n)`, 길이를 예측하기 어려운 긴 글은 `TEXT` 계열이 어울립니다. 날짜와 시각을 함께 저장하려면 `DATE` 가 아니라 `DATETIME` 을 씁니다.'
    },
    {
      level: 2,
      content: `채점 항목:
- posts 테이블을 만들어야 합니다.
- post_id 는 정수 타입이어야 합니다.
- title 은 최대 200자로 제한해야 합니다.
- body 에 긴 글에 맞는 타입을 골라야 합니다.
- published_at 은 날짜와 시각을 함께 담는 타입이어야 합니다.
- 두 문자열 타입을 고른 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- title 은 목록에 보여 줄 짧은 값이라 길이 상한을 둔 VARCHAR(200) 을,
-- body 는 수만 자까지 쓰일 수 있어 길이를 미리 정하기 어려우므로 TEXT 를 골랐습니다.
CREATE TABLE posts (
  post_id      INT,
  title        VARCHAR(200),
  body         TEXT,
  published_at DATETIME
);
`
    }
  ]
}
