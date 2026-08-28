import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_3: CurriculumStep = {
  id: 'regex-1-3',
  title: '정규식 기초 · 수량자 (Quantifiers)',
  order: 202,
  category: 'advanced',
  content: {
    mission:
      '사용자명(username) 유효성을 검사하는 `isValidUsername(username: string): boolean` 함수를 작성하세요. 사용자명 조건: 영문 소문자, 숫자, 언더바(_), 하이픈(-)만 허용하고, 길이는 최소 3자 최대 20자여야 합니다.',
    theory: `
## 수량자(Quantifier) — 반복 횟수 지정

수량자는 앞의 패턴(문자, 메타문자, 그룹 등)이 **몇 번 반복**되는지를 지정합니다.

### ① 기본 수량자 3종

| 기호 | 의미            | 동일 표현      |
|------|-----------------|---------------|
| \`+\`  | 1번 이상 반복   | \`{1,}\`       |
| \`*\`  | 0번 이상 반복   | \`{0,}\`       |
| \`?\`  | 0번 또는 1번    | \`{0,1}\`      |

\`\`\`ts
/a+/.test('aaa');   // true  (3회 반복)
/a+/.test('b');     // false (a가 한 번도 없음)
/a*/.test('b');     // true  (a가 0번 — 항상 true)
/a?b/.test('b');    // true  (a가 0번 + b)
/a?b/.test('ab');   // true  (a가 1번 + b)
/a?b/.test('aab');  // false (a가 2번이면 불일치)
\`\`\`

### ② 정확한 반복 {n}

\`\`\`ts
/\\d{4}/.test('2024');    // true  (숫자 정확히 4자리)
/\\d{4}/.test('202');     // false (3자리)
/[A-Z]{3}/.test('ABC');  // true
/[A-Z]{3}/.test('AB');   // false
\`\`\`

### ③ 범위 반복 {n,m}

\`\`\`ts
/\\d{2,4}/.test('12');    // true  (2자리 — 최솟값)
/\\d{2,4}/.test('1234');  // true  (4자리 — 최댓값)
/\\d{2,4}/.test('12345'); // true! ← 주의: 5자리 중 앞의 4자리에 매칭됨
                           //   완전 일치는 ^ $ 앵커 필요

// ^ $ 앵커와 조합
/^\\d{2,4}$/.test('12345');  // false (전체가 2~4자리가 아님)
/^\\d{2,4}$/.test('123');    // true
\`\`\`

### ④ 최솟값만 지정 {n,}

\`\`\`ts
/\\w{3,}/.test('ab');      // false (2자리, 최소 3 미달)
/\\w{3,}/.test('abc');     // true  (정확히 3자리)
/\\w{3,}/.test('abcdefg'); // true  (7자리, 3 이상이므로 통과)

// 비밀번호 최소 8자리 검사
/^.{8,}$/.test('short');      // false (5자리)
/^.{8,}$/.test('longpassword'); // true
\`\`\`

### ⑤ 탐욕(Greedy) vs 비탐욕(Lazy)

기본 수량자는 **탐욕적(greedy)**으로 동작해 가능한 한 길게 매칭합니다.
\`?\`를 수량자 뒤에 붙이면 **비탐욕(lazy)** 으로 바뀝니다.

\`\`\`ts
// 탐욕 매칭: 가능한 한 길게
'<b>hello</b>'.match(/<.+>/)[0];   // '<b>hello</b>' — 전체를 삼킴

// 비탐욕 매칭: 가능한 한 짧게
'<b>hello</b>'.match(/<.+?>/)[0];  // '<b>  — 첫 번째 닫는 </b>'에서 멈춤
\`\`\`

### ⑥ 사용자명 패턴 조합 예시

\`\`\`ts
// 영문 소문자, 숫자, 언더바, 하이픈 3~20자
const usernameRegex = /^[a-z0-9_-]{3,20}$/;

usernameRegex.test('alice');         // true
usernameRegex.test('user_name-123'); // true
usernameRegex.test('ab');            // false (2자 — 최솟값 미달)
usernameRegex.test('a'.repeat(21));  // false (21자 — 최댓값 초과)
usernameRegex.test('User Name');     // false (대문자, 공백 불허)
\`\`\`
    `,
    objectives: [
      '문자 클래스 `[a-z0-9_-]`로 허용 문자를 정확히 지정할 것',
      '`{3,20}` 수량자로 길이 제한(최소 3, 최대 20)을 표현할 것',
      '`^`와 `$` 앵커를 함께 사용하여 전체 문자열이 패턴과 일치하는지 검사할 것'
    ],
    exercise: `
1. \`isValidUsername\` 함수 내부에 허용 문자(\`a-z\`, \`0-9\`, \`_\`, \`-\`)와 길이(3~20자) 조건을 포함한 정규식을 선언하세요.
2. \`regex.test(username)\`으로 검증한 결과를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function isValidUsername(username: string): boolean {
  // 영문 소문자, 숫자, 언더바(_), 하이픈(-), 3~20자 길이 검증
  return false;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\{3,20\}/,
        message: '{3,20} 수량자를 사용하여 길이 3~20자 조건을 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\^.*\$/,
        message: '^와 $ 앵커를 사용하여 전체 문자열을 검사해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.test(',
        message: 'test() 메서드를 사용하여 검증 결과를 반환해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '문자 클래스 안에 `a-z`, `0-9`, `_`, `-`를 모두 포함하세요: `[a-z0-9_-]`. 하이픈은 범위 오해를 피하기 위해 맨 뒤에 위치시키세요.'
    },
    {
      level: 2,
      content: '`{3,20}`은 앞의 패턴이 최소 3번, 최대 20번 반복됨을 의미합니다. 앵커와 함께 `/^[a-z0-9_-]{3,20}$/`로 작성하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function isValidUsername(username: string): boolean {
  const regex = /^[a-z0-9_-]{3,20}$/;
  return regex.test(username);
}`
    }
  ]
}
