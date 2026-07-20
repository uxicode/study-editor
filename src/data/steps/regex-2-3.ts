import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_3: CurriculumStep = {
  id: 'regex-2-3',
  title: '정규식 중급 · 전방 탐색과 후방 탐색 (Lookahead / Lookbehind)',
  order: 208,
  category: 'advanced',
  content: {
    mission:
      '비밀번호 복잡도를 검사하는 `checkPasswordStrength(password: string): { score: number; feedback: string[] }` 함수를 작성하세요. 다음 4가지 조건을 각각 전방 탐색으로 검사하고 통과한 조건 수를 `score`로, 실패한 조건에 대한 피드백 메시지를 `feedback` 배열로 반환하세요.\n\n조건: ①최소 8자, ②소문자 포함, ③대문자 포함, ④숫자 포함',
    theory: `
## 탐색(Lookaround) — 위치 확인 후 소비하지 않음

탐색은 특정 패턴이 **앞에 있는지/뒤에 있는지만** 확인하고 실제 문자를 소비하지 않습니다.
따라서 매칭 결과에 탐색 부분은 포함되지 않습니다.

### ① 전방 탐색 (Lookahead) — (?=...)

"앞(오른쪽)에 이 패턴이 있어야 한다"

\`\`\`ts
// '숫자로 끝나는 단어'를 찾되, 숫자 자체는 매칭에 포함하지 않음
'item1 product2 foo'.match(/\\w+(?=\\d)/g);  // ['item', 'product']

// 비밀번호에 숫자가 포함되어 있는지 확인
// (?=.*\\d) : 어딘가에 숫자가 하나 이상 존재해야 함
/^(?=.*\\d)/.test('abc123');   // true  (숫자 있음)
/^(?=.*\\d)/.test('abcdef');   // false (숫자 없음)
\`\`\`

### ② 부정 전방 탐색 (Negative Lookahead) — (?!...)

"앞(오른쪽)에 이 패턴이 **없어야** 한다"

\`\`\`ts
// 'foo'가 뒤에 오지 않는 'bar' 찾기
'barfoo bar1'.match(/bar(?!foo)/g);   // ['bar'] (bar1의 bar만)

// 숫자로 끝나지 않는 단어
'cat1 dog fox2'.match(/\\b[a-z]+(?![\\d])\\b/g);  // ['dog']
\`\`\`

### ③ 후방 탐색 (Lookbehind) — (?<=...)

"뒤(왼쪽)에 이 패턴이 있어야 한다" (ES2018+, Node.js 지원)

\`\`\`ts
// $ 기호 뒤에 오는 숫자 추출 ($ 자체는 포함하지 않음)
'$100 and €200 or £300'.match(/(?<=\\$)\\d+/g);   // ['100']

// 성(Last)이 있는 이름에서 이름(First)만 추출
'John Smith, Jane Doe'.match(/(?<=\\w+ )\\w+/g);   // ['Smith', 'Doe']
\`\`\`

### ④ 부정 후방 탐색 (Negative Lookbehind) — (?<!...)

"뒤(왼쪽)에 이 패턴이 **없어야** 한다"

\`\`\`ts
// $ 가 앞에 없는 숫자만 추출
'$100 200 $300 400'.match(/(?<!\\$)\\d+/g);  // ['200', '400']
\`\`\`

### ⑤ 비밀번호 복잡도 검사에 lookahead 적용

각 조건을 독립적으로 검사하는 패턴:

\`\`\`ts
const hasLower  = /(?=.*[a-z])/;   // 소문자 포함 여부
const hasUpper  = /(?=.*[A-Z])/;   // 대문자 포함 여부
const hasDigit  = /(?=.*\\d)/;      // 숫자 포함 여부
const hasMinLen = /^.{8,}$/;       // 최소 8자

// 모든 조건을 하나의 정규식으로 합칠 수도 있음
const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;
strong.test('Passw0rd');    // true
strong.test('password');    // false (대문자, 숫자 없음)
strong.test('PASSWORD1');   // false (소문자 없음)
strong.test('Short1');      // false (8자 미만)
\`\`\`

### ⑥ 탐색과 일반 패턴 조합

\`\`\`ts
// 가격 파싱: 통화 기호 뒤에 오는 숫자와 소수점
'$19.99 €42.00 ¥3000'.matchAll(/(?<=[\\$€¥])([\\d,]+\\.?\\d*)/g);
// 각 통화 뒤의 금액을 순서대로 추출
\`\`\`
    `,
    objectives: [
      '4가지 조건(길이, 소문자, 대문자, 숫자) 각각을 `test()`로 검사하여 통과 횟수를 `score`로 계산할 것',
      '전방 탐색 패턴 `(?=.*[조건])`을 이해하고 활용할 것',
      '실패한 조건의 설명 메시지를 `feedback` 배열에 누적할 것'
    ],
    exercise: `
1. 4가지 조건(최소 8자, 소문자 포함, 대문자 포함, 숫자 포함)에 해당하는 정규식을 각각 선언하세요.
   - 소문자: \`/(?=.*[a-z])/\`, 대문자: \`/(?=.*[A-Z])/\`, 숫자: \`/(?=.*\\\\d)/\`
2. 각 조건을 \`test(password)\`로 검사하고, 통과하면 \`score\`를 증가시키고 실패하면 \`feedback\` 배열에 메시지를 추가하세요.
3. \`{ score, feedback }\` 객체를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface PasswordCheckResult {
  score: number;
  feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordCheckResult {
  let score = 0;
  const feedback: string[] = [];

  // 조건 1: 최소 8자 이상
  if (password.length >= 8) {
    score++;
  } else {
    feedback.push('비밀번호는 최소 8자 이상이어야 합니다.');
  }

  // 조건 2: 소문자 포함 — 전방 탐색 패턴을 사용해 완성하세요
  // TODO

  // 조건 3: 대문자 포함 — 전방 탐색 패턴을 사용해 완성하세요
  // TODO

  // 조건 4: 숫자 포함 — 전방 탐색 패턴을 사용해 완성하세요
  // TODO

  return { score, feedback };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?=\.\*\[a-z\]\)/,
        message: '소문자 포함 여부를 전방 탐색 (?=.*[a-z])으로 검사해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?=\.\*\[A-Z\]\)/,
        message: '대문자 포함 여부를 전방 탐색 (?=.*[A-Z])으로 검사해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?=\.\*\\d\)/,
        message: '숫자 포함 여부를 전방 탐색 (?=.*\\d)으로 검사해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`/(?=.*[a-z])/.test(password)`는 password 어딘가에 소문자가 하나 이상 있으면 true를 반환합니다. `(?=.*)` 부분이 "어딘가에"를 의미합니다.'
    },
    {
      level: 2,
      content: '각 조건마다 동일한 패턴을 반복하세요: `if (/(?=.*[A-Z])/.test(password)) { score++; } else { feedback.push(\'...\'); }`'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function checkPasswordStrength(password: string): PasswordCheckResult {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('비밀번호는 최소 8자 이상이어야 합니다.');

  if (/(?=.*[a-z])/.test(password)) score++;
  else feedback.push('소문자를 하나 이상 포함해야 합니다.');

  if (/(?=.*[A-Z])/.test(password)) score++;
  else feedback.push('대문자를 하나 이상 포함해야 합니다.');

  if (/(?=.*\\d)/.test(password)) score++;
  else feedback.push('숫자를 하나 이상 포함해야 합니다.');

  return { score, feedback };
}`
    }
  ]
}
