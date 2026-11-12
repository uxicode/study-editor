import type { CurriculumStep } from '@/types/curriculum'

export const week_2_1_p2: CurriculumStep = {
  id: 'week-2-1-p2',
  title: '1주차 · 연습 ② CREATE TABLE 기본 — 회원 프로필과 날짜 · 참거짓 타입',
  order: 3,
  category: 'schema',
  content: {
    mission: '회원 프로필을 저장할 `user_profiles` 테이블을 만들고, 생년월일과 동의 여부에 맞는 타입을 고르세요.',
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
      'DATE 와 DATETIME 의 차이 이해',
      '참/거짓 값을 저장하는 타입 고르기',
      '직전 스텝(CREATE TABLE 기본)의 내용을 스스로 적용하기'
    ],
    exercise: `
**상황**
회원가입 화면에서 닉네임, 생년월일, 마케팅 수신 동의 여부를 입력받습니다. 생년월일은 연령 확인에만 쓰이고 시각 정보는 필요 없습니다. 기획자는 "나이" 를 저장하자고 했지만 개발팀은 생년월일을 저장하기로 했습니다.

**요구사항**
1. \`user_profiles\` 테이블을 만드세요. (포함할 컬럼: \`user_id\`, \`nickname\`, \`birth_date\`, \`marketing_agreed\`)
2. \`nickname\` 은 최대 30자입니다.
3. \`birth_date\` 에는 시각 없이 날짜만 저장합니다.
4. \`marketing_agreed\` 는 동의(참) / 미동의(거짓) 두 가지 값만 가집니다.

**생각해 보기** (\`--\` 주석으로 작성)
- \`age\` 컬럼 대신 생년월일을 저장하는 것이 나은 이유를 서술해 주세요.
    `.trim(),
    expectedOutput: '회원 프로필과 날짜 · 참거짓 타입 — 모든 채점 항목 통과'
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
        pattern: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?user_profiles\s*\(/i,
        message: 'user_profiles 테이블을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /nickname\s+VARCHAR\s*\(\s*30\s*\)/i,
        message: 'nickname 은 최대 30자로 제한해야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /birth_date\s+DATE\b/i,
        message: 'birth_date 는 날짜만 담는 타입이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /marketing_agreed\s+(?:BOOLEAN|BOOL|TINYINT\s*\(\s*1\s*\))/i,
        message: 'marketing_agreed 는 참/거짓 타입이어야 합니다.'
      },
      {
        type: 'regex',
        target: 'schema.sql',
        pattern: /--[^\n]*(?:나이|생년월일|age)/i,
        message: '나이 대신 생년월일을 저장하는 이유를 -- 주석으로 서술해야 합니다.'
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
      content: '시각 없이 날짜만 필요하면 `DATE`, 참/거짓은 `BOOLEAN` 입니다. 나이는 해가 바뀔 때마다 값이 달라진다는 점을 생각해 보세요.'
    },
    {
      level: 2,
      content: `채점 항목:
- user_profiles 테이블을 만들어야 합니다.
- nickname 은 최대 30자로 제한해야 합니다.
- birth_date 는 날짜만 담는 타입이어야 합니다.
- marketing_agreed 는 참/거짓 타입이어야 합니다.
- 나이 대신 생년월일을 저장하는 이유를 -- 주석으로 서술해야 합니다.`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `-- 나이는 해가 바뀔 때마다 모든 회원의 값을 고쳐야 하지만,
-- 생년월일은 변하지 않고 언제든 나이를 계산해 낼 수 있습니다.
CREATE TABLE user_profiles (
  user_id          INT,
  nickname         VARCHAR(30),
  birth_date       DATE,
  marketing_agreed BOOLEAN
);
`
    }
  ]
}
