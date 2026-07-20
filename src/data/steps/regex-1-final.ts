import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_final: CurriculumStep = {
  id: 'regex-1-final',
  title: '정규식 기초 종합 · 회원가입 폼 유효성 검사기',
  order: 205,
  category: 'advanced',
  content: {
    mission:
      '회원가입 폼의 세 필드를 동시에 검증하는 `validateSignupForm(data: { email: string; password: string; phone: string }): { isValid: boolean; errors: string[] }` 함수를 작성하세요.\n\n**검증 규칙:**\n- 이메일: 표준 이메일 형식\n- 비밀번호: 최소 8자, 영문·숫자 포함 (특수문자 선택)\n- 전화번호: `010-XXXX-XXXX` 또는 `010XXXXXXXX` 형식\n\n각 항목이 실패하면 `errors` 배열에 실패 메시지를 추가하세요.',
    theory: `
## 기초 종합: 실무에서 자주 쓰는 유효성 검사 패턴

지금까지 배운 메타문자, 문자 클래스, 수량자, 앵커, 플래그를 조합하여
실무에서 자주 쓰는 폼 유효성 검사를 구현해봅니다.

### 이메일 검증 패턴 분해

\`\`\`ts
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
//                  ^────────────────  ^──────────────── ^────────────  $
//                  계정명 부분        도메인 이름         TLD (2자 이상)
//
// 계정명: 영문자, 숫자, 일부 특수문자(. _ % + -)
// 도메인: 영문자, 숫자, 점(.), 하이픈(-)
// TLD: 영문자만 2자 이상 (com, kr, io, co.uk 등)

emailRegex.test('user@example.com');      // true
emailRegex.test('user.name+tag@sub.io');  // true
emailRegex.test('missing-at-sign');       // false
emailRegex.test('@nodomain.com');         // false
emailRegex.test('user@.com');             // false
\`\`\`

### 비밀번호 검증 — 두 가지 접근 방식

**방법 1: 단일 정규식 (lookahead 사용, 중급에서 배울 내용)**
\`\`\`ts
// (?=.*\\d)  → 숫자가 하나 이상 포함되어야 함
// (?=.*[a-zA-Z]) → 알파벳이 하나 이상 포함되어야 함
const strongPassword = /^(?=.*\\d)(?=.*[a-zA-Z]).{8,}$/;
\`\`\`

**방법 2: 여러 정규식으로 나눠서 검사 (기초 수준)**
\`\`\`ts
function isValidPassword(pw: string): boolean {
  const minLength = pw.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasDigit  = /\\d/.test(pw);
  return minLength && hasLetter && hasDigit;
}
\`\`\`

### 전화번호 패턴 — 두 형식 모두 허용

\`\`\`ts
// 형식 1: 010-XXXX-XXXX (하이픈 있음)
// 형식 2: 010XXXXXXXX    (하이픈 없음)
// |----|  교대(|)로 두 패턴 중 하나 허용
const phoneRegex = /^(010-\\d{4}-\\d{4}|010\\d{8})$/;

phoneRegex.test('010-1234-5678');  // true
phoneRegex.test('01012345678');    // true
phoneRegex.test('011-1234-5678'); // false (010이 아님)
phoneRegex.test('010-123-5678');  // false (중간이 3자리)
\`\`\`

### 유효성 검사 결과 누적 패턴

\`\`\`ts
const errors: string[] = [];

if (조건을_통과_못_했을_때) {
  errors.push('실패 메시지');
}

return {
  isValid: errors.length === 0,
  errors,
};
\`\`\`
    `,
    objectives: [
      '이메일, 비밀번호, 전화번호 각각에 대한 정규식을 선언하고 검증할 것',
      '각 검증 실패 시 `errors` 배열에 오류 메시지를 push할 것',
      '`errors.length === 0`이면 `isValid: true`, 하나라도 실패하면 `isValid: false`를 반환할 것'
    ],
    exercise: `
1. 이메일, 비밀번호, 전화번호에 대한 정규식을 각각 선언하세요.
   - 이메일: \`/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$/\`
   - 비밀번호: 길이 8 이상 AND 영문 AND 숫자 포함 여부를 별도 조건으로 체크해도 됩니다.
   - 전화번호: 하이픈 있는 형식 또는 없는 형식 모두 허용
2. 각 검증이 실패하면 \`errors\` 배열에 명확한 오류 메시지를 추가하세요.
3. \`{ isValid: errors.length === 0, errors }\`를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface SignupData {
  email: string;
  password: string;
  phone: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSignupForm(data: SignupData): ValidationResult {
  const errors: string[] = [];

  // 1. 이메일 검증
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    errors.push('이메일 형식이 올바르지 않습니다.');
  }

  // 2. 비밀번호 검증 (최소 8자, 영문 + 숫자 포함)
  // TODO: 비밀번호 검증 로직을 추가하세요.

  // 3. 전화번호 검증
  // TODO: 전화번호 검증 로직을 추가하세요.

  return { isValid: errors.length === 0, errors };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /errors\.push\(/,
        message: 'errors 배열에 push()로 오류 메시지를 추가해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /errors\.length/,
        message: 'errors.length로 isValid 값을 결정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /010/,
        message: '전화번호 패턴(010으로 시작)을 정규식으로 검증해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '비밀번호는 단일 정규식 대신 두 조건으로 나누어 검사할 수 있습니다: `data.password.length >= 8` AND `/[a-zA-Z]/.test(data.password)` AND `/\\d/.test(data.password)`.'
    },
    {
      level: 2,
      content: '전화번호 패턴은 `/^(010-\\d{4}-\\d{4}|010\\d{8})$/`를 사용하세요. `|`(파이프)를 이용해 하이픈 있는 형식과 없는 형식을 모두 허용합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function validateSignupForm(data: SignupData): ValidationResult {
  const errors: string[] = [];

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(data.email)) {
    errors.push('이메일 형식이 올바르지 않습니다.');
  }

  if (data.password.length < 8 || !/[a-zA-Z]/.test(data.password) || !/\\d/.test(data.password)) {
    errors.push('비밀번호는 8자 이상이며 영문자와 숫자를 포함해야 합니다.');
  }

  const phoneRegex = /^(010-\\d{4}-\\d{4}|010\\d{8})$/;
  if (!phoneRegex.test(data.phone)) {
    errors.push('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
  }

  return { isValid: errors.length === 0, errors };
}`
    }
  ]
}
