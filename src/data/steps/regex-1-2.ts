import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_2: CurriculumStep = {
  id: 'regex-1-2',
  title: '정규식 기초 · 문자 클래스와 범위',
  order: 201,
  category: 'advanced',
  content: {
    mission:
      '한국 우편번호(5자리 숫자, 예: `12345`)와 한국 사업자등록번호(`000-00-00000` 형식)를 각각 검증하는 두 함수 `isValidPostalCode(code: string): boolean`과 `isValidBusinessNumber(num: string): boolean`을 작성하세요.',
    theory: `
## 문자 클래스(Character Class) — [ ]

대괄호 \`[...]\` 안에 허용할 문자들을 직접 나열하거나 범위로 지정합니다.

### ① 직접 나열

\`\`\`ts
/[aeiou]/        // 모음 하나
/[aeiou]/i       // 대소문자 구분 없이 모음 하나 (i 플래그)
/[aeiouAEIOU]/   // 명시적으로 대소문자 모음 모두 허용
'hello'.match(/[aeiou]/g);  // ['e', 'o']
\`\`\`

### ② 범위(Range) 지정

\`\`\`ts
/[a-z]/   // 소문자 알파벳 한 글자
/[A-Z]/   // 대문자 알파벳 한 글자
/[0-9]/   // 숫자 한 글자 (\\d와 동일)
/[a-zA-Z0-9]/  // 영문자 + 숫자 한 글자 (\\w에서 _ 제외)

// 예시: 16진수 문자 탐지
/[0-9a-fA-F]/.test('ff');   // true
/[0-9a-fA-F]/.test('zz');   // false
\`\`\`

### ③ 부정 문자 클래스 [^ ]

캐럿(^)을 대괄호 안 첫 번째에 쓰면 **"해당 문자들이 아닌 것"** 을 의미합니다.

\`\`\`ts
/[^0-9]/   // 숫자가 아닌 문자 (\\D와 동일)
/[^a-z]/   // 소문자 알파벳이 아닌 모든 문자

// 숫자만 남기기
'abc123def456'.replace(/[^0-9]/g, '');  // '123456'

// 특수문자 제거 (영문, 숫자, 공백만 허용)
'Hello, World!'.replace(/[^a-zA-Z0-9 ]/g, '');  // 'Hello World'
\`\`\`

### ④ 문자 클래스 안의 특수 문자 이스케이프

대괄호 안에서 특수한 의미를 갖는 문자: \`]\`, \`\\\\\`, \`^\`(첫 번째 위치), \`-\`(중간 위치)

\`\`\`ts
/[\\-.]/.test('-');   // true  → 하이픈과 점을 허용
/[\\-.]/.test('.');   // true

// 하이픈을 범위가 아닌 리터럴로 쓰려면 맨 앞/뒤에 두거나 이스케이프
/[-a-z]/.test('-');   // true  (맨 앞에 두면 리터럴 취급)
/[a-z-]/.test('-');   // true  (맨 뒤에 두면 리터럴 취급)
\`\`\`

### ⑤ 실전 — 한국 도메인/우편번호 패턴

\`\`\`ts
// 5자리 숫자 우편번호
const postalRegex = /^[0-9]{5}$/;
postalRegex.test('12345');   // true
postalRegex.test('1234');    // false (4자리)
postalRegex.test('1234a');   // false (숫자가 아닌 문자 포함)

// 한글 이름 포함 여부 (가-힣 범위)
/[가-힣]/.test('홍길동');    // true
/[가-힣]/.test('Hong');      // false
\`\`\`

### ⑥ 사업자등록번호 구조 분석

\`\`\`ts
// 형식: 3자리-2자리-5자리
// 예:   123-45-67890
const bizRegex = /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/;
bizRegex.test('123-45-67890');   // true
bizRegex.test('12-45-67890');    // false (첫 블록이 2자리)
bizRegex.test('123-45-6789');    // false (마지막 블록이 4자리)
\`\`\`
    `,
    objectives: [
      '`[0-9]{5}` 또는 `\\\\d{5}` 패턴으로 5자리 숫자를 검증할 것',
      '`^`와 `$` 앵커를 사용해 전체 문자열이 패턴과 완전히 일치하는지 확인할 것',
      '하이픈(-)을 포함한 사업자등록번호 패턴을 문자 클래스와 수량자로 정확히 표현할 것'
    ],
    exercise: `
1. \`isValidPostalCode\` 함수 내부에서 5자리 숫자만 허용하는 정규식을 선언하고 \`test()\` 결과를 반환하세요.
2. \`isValidBusinessNumber\` 함수 내부에서 \`000-00-00000\` 형식을 허용하는 정규식을 선언하고 검증하세요.
   - 반드시 \`^\`(시작)과 \`$\`(끝) 앵커를 사용하여 부분 일치를 방지하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function isValidPostalCode(code: string): boolean {
  // 5자리 숫자 우편번호 검증
  return false;
}

export function isValidBusinessNumber(num: string): boolean {
  // 000-00-00000 형식의 사업자등록번호 검증
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
        pattern: /\{5\}/,
        message: '{5} 수량자를 사용하여 정확히 5자리를 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\^.*\$/,
        message: '^와 $ 앵커를 사용하여 완전 일치를 검사해야 합니다.'
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
      content: '우편번호는 `/^[0-9]{5}$/`로 표현합니다. `^`는 문자열 시작, `$`는 끝을 의미하여 정확히 5자리만 허용합니다.'
    },
    {
      level: 2,
      content: '사업자등록번호 패턴은 `/^[0-9]{3}-[0-9]{2}-[0-9]{5}$/`입니다. 하이픈은 리터럴 문자로 그대로 씁니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function isValidPostalCode(code: string): boolean {
  return /^[0-9]{5}$/.test(code);
}

export function isValidBusinessNumber(num: string): boolean {
  return /^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(num);
}`
    }
  ]
}
