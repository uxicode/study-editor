import type { CurriculumStep } from '@/types/curriculum'

export const week_9_2: CurriculumStep = {
  id: 'week-9-2',
  title: '9주차 · 비밀번호는 저장하지 않는다: bcrypt 해싱과 비교',
  order: 50,
  category: 'advanced',
  content: {
    mission:
      '회원가입·로그인에서 공통으로 쓸 비밀번호 유틸 `lib/password.ts`를 완성하세요.\n- `hashPassword(plain)`: `bcrypt.hash(plain, SALT_ROUNDS)`로 해시를 만들어 반환 (`SALT_ROUNDS = 12`)\n- `verifyPassword(plain, hash)`: `bcrypt.compare(plain, hash)` 결과를 반환\n- 두 함수 모두 먼저 `assertPasswordLength(plain)`을 호출해 **UTF-8 기준 72바이트 초과** 입력을 거부하세요.\n- 비밀번호나 해시를 `===`/`==`로 직접 비교하면 통과할 수 없습니다.',
    theory: `
## 핵심 원칙: 서버는 비밀번호를 "알면" 안 된다

DB가 유출되는 일은 생각보다 흔합니다. 그때 피해를 결정하는 것은 **비밀번호를 어떤 형태로 저장했느냐**입니다.

| 저장 방식 | 유출 시 결과 | 판정 |
|-----------|-------------|------|
| 평문 | 그대로 노출. 다른 사이트 계정까지 연쇄 탈취 | 절대 금지 |
| 암호화 (AES 등) | 키가 함께 털리면 전부 복호화 | 금지 (복호화 가능 = 평문과 같음) |
| 단순 해시 (SHA-256, MD5) | GPU로 초당 수십억 번 대입. 레인보우 테이블 | 금지 |
| 단순 해시 + salt | 레인보우 테이블은 막지만 여전히 너무 빠름 | 부족 |
| **느린 해시 (argon2id, bcrypt, scrypt)** | 한 번 계산에 수십~수백 ms. 대입 비용이 폭증 | 권장 |

> OWASP 권장 순서는 argon2id → scrypt → bcrypt 입니다. bcrypt는 가장 널리 쓰이고 라이브러리가 안정적이라 이 실습에서 사용합니다. 핵심 개념(salt, work factor, compare)은 셋 모두 같습니다.

## 1. salt — 같은 비밀번호도 다른 해시

salt는 해시하기 전에 섞는 **사용자별 무작위 값**입니다. bcrypt는 salt를 자동으로 만들어 결과 문자열 안에 함께 저장합니다.

\`\`\`text
$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
 │   │  └──────────── salt (22자) ────┘└──────── 해시 (31자) ────────┘
 │   └─ cost(work factor) = 12  →  2^12 번 반복
 └──── 알고리즘 버전
\`\`\`

그래서 \`hash('pw')\`를 두 번 호출하면 **매번 다른 문자열**이 나옵니다. 이것이 정상입니다.

## 2. work factor(cost) — 일부러 느리게

cost가 1 오르면 계산 시간이 2배가 됩니다. 로그인 1회에 **약 100~300ms**가 걸리도록 맞추는 것이 일반적입니다. 현재 서버 기준으로 bcrypt는 **10~12 이상**을 권장합니다.

## 3. 비교는 반드시 compare로

\`\`\`ts
// 잘못된 예 1: 평문 비교 — DB에 평문이 있다는 뜻
if (password === user.password) { ... }

// 잘못된 예 2: 다시 해시해서 비교 — salt가 매번 달라서 항상 false
if ((await bcrypt.hash(password, 12)) === user.passwordHash) { ... }

// 올바른 예
const ok = await bcrypt.compare(password, user.passwordHash);
\`\`\`

\`bcrypt.compare\`는 저장된 해시에서 salt와 cost를 꺼내 입력값을 같은 조건으로 다시 해시한 뒤, **상수 시간(constant-time)**으로 비교합니다. 일반 \`===\`는 앞 글자부터 비교하다 다르면 즉시 멈추기 때문에, 응답 시간 차이로 정답을 한 글자씩 추측하는 **타이밍 공격**의 단서가 됩니다.

## 4. bcrypt의 72바이트 제한

bcrypt는 입력의 **앞 72바이트만** 사용하고 나머지는 조용히 버립니다. 한글은 UTF-8로 한 글자에 3바이트라서 24글자만 넘어도 잘립니다.

\`\`\`ts
new TextEncoder().encode('비밀번호').length; // 12 (4글자 × 3바이트)
\`\`\`

잘린 채로 저장하면 "앞 72바이트만 같은 다른 비밀번호"로도 로그인됩니다. 그래서 **명시적으로 거부**하는 것이 안전합니다. 아주 긴 입력을 그대로 받으면 해시 계산으로 CPU를 소모시키는 DoS에도 노출되므로, 최대 길이 제한은 어떤 알고리즘에서든 필요합니다.

## 5. 프론트엔드에서 해싱하면 안 되나요?

안 됩니다. 브라우저에서 해시한 값을 보내면 **그 해시가 곧 비밀번호**가 됩니다. 탈취한 해시를 그대로 보내면 로그인되니까요. 전송 구간 보호는 **HTTPS**의 몫이고, 해싱은 **서버**의 몫입니다.

## 흔한 실수

- \`console.log(req.body)\`로 비밀번호가 로그·모니터링 도구에 평문으로 남는 경우
- 비밀번호 앞뒤 공백을 \`trim()\` — 사용자가 의도한 비밀번호가 바뀝니다 (이메일만 trim)
- \`bcrypt.hashSync\` 사용 — 계산하는 동안 Node 이벤트 루프 전체가 멈춥니다. 서버에서는 async 버전을 쓰세요.
    `,
    objectives: [
      '평문, 암호화, 단순 해시가 비밀번호 저장에 부적합한 이유를 설명할 수 있다',
      'salt와 work factor(cost)가 각각 어떤 공격을 막는지 설명할 수 있다',
      'bcrypt.hash와 bcrypt.compare로 비밀번호를 저장하고 검증할 수 있다',
      '=== 비교가 위험한 이유(평문 저장, 타이밍 공격)를 설명할 수 있다',
      'bcrypt의 72바이트 제한을 UTF-8 바이트 길이로 검사할 수 있다'
    ],
    exercise: `
1. \`assertPasswordLength(plain)\`: \`new TextEncoder().encode(plain).length\`가 \`MAX_PASSWORD_BYTES\`(72)를 넘으면 \`Error\`를 던지세요.
2. \`hashPassword(plain)\`: 길이 검사 후 \`await bcrypt.hash(plain, SALT_ROUNDS)\`를 반환하세요.
3. \`verifyPassword(plain, hash)\`: 길이 검사 후 \`await bcrypt.compare(plain, hash)\`를 반환하세요.
4. 어떤 경우에도 비밀번호·해시를 \`===\`로 비교하지 마세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'password.ts',
      path: 'lib/password.ts',
      content: `import bcrypt from 'bcryptjs';

export const SALT_ROUNDS = 12;
export const MAX_PASSWORD_BYTES = 72;

export function assertPasswordLength(plain: string): void {
  // TODO: UTF-8 바이트 길이가 MAX_PASSWORD_BYTES 를 넘으면 에러를 던지세요.
}

export async function hashPassword(plain: string): Promise<string> {
  // TODO: 길이 검사 후 bcrypt 해시를 반환하세요.
  return plain;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  // TODO: 길이 검사 후 bcrypt.compare 결과를 반환하세요.
  return false;
}
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /await\s+bcrypt\.hash\(\s*plain\s*,\s*SALT_ROUNDS\s*\)/,
        message: 'hashPassword 안에서 await bcrypt.hash(plain, SALT_ROUNDS)로 해시를 생성하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /await\s+bcrypt\.compare\(\s*plain\s*,\s*hash\s*\)/,
        message: 'verifyPassword 안에서 await bcrypt.compare(plain, hash)로 비교하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /SALT_ROUNDS\s*=\s*1[0-4]\b/,
        message: 'SALT_ROUNDS(cost)는 10~14 사이로 설정하세요. 이 실습의 기준값은 12입니다.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /new\s+TextEncoder\(\)\.encode\(\s*plain\s*\)\.length\s*>\s*MAX_PASSWORD_BYTES/,
        message: 'assertPasswordLength에서 new TextEncoder().encode(plain).length > MAX_PASSWORD_BYTES 조건으로 바이트 길이를 검사하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /throw\s+new\s+Error\(/,
        message: '72바이트를 넘는 비밀번호는 throw new Error(...)로 거부하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /hashPassword[\s\S]*?\{[\s\S]*?assertPasswordLength\(\s*plain\s*\)[\s\S]*?verifyPassword[\s\S]*?\{[\s\S]*?assertPasswordLength\(\s*plain\s*\)/,
        message: 'hashPassword와 verifyPassword 두 함수 모두 첫 줄에서 assertPasswordLength(plain)을 호출하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /^(?![\s\S]*\b\w*(?:plain|password|hash)\w*\s*[!=]==?(?!>))(?![\s\S]*[!=]==?\s*\w*(?:plain|password|hash)\w*\b)[\s\S]*$/i,
        message: '비밀번호나 해시를 ===/== 로 직접 비교하지 마세요. 평문 저장·타이밍 공격의 원인이 됩니다. bcrypt.compare()만 사용하세요.'
      },
      {
        type: 'regex',
        target: 'lib/password.ts',
        pattern: /^(?![\s\S]*hashSync|[\s\S]*compareSync)[\s\S]*$/,
        message: 'hashSync/compareSync는 서버 이벤트 루프를 멈춥니다. async 버전(bcrypt.hash, bcrypt.compare)을 사용하세요.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '바이트 길이는 `new TextEncoder().encode(plain).length`로 구합니다. `plain.length`는 글자 수라서 한글에서 틀립니다.'
    },
    {
      level: 2,
      content: '`hashPassword`는 `assertPasswordLength(plain); return await bcrypt.hash(plain, SALT_ROUNDS);`, `verifyPassword`는 같은 패턴으로 `bcrypt.compare(plain, hash)`를 반환합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import bcrypt from 'bcryptjs';

export const SALT_ROUNDS = 12;
export const MAX_PASSWORD_BYTES = 72;

export function assertPasswordLength(plain: string): void {
  if (new TextEncoder().encode(plain).length > MAX_PASSWORD_BYTES) {
    throw new Error('비밀번호는 UTF-8 기준 72바이트 이하여야 합니다.');
  }
}

export async function hashPassword(plain: string): Promise<string> {
  assertPasswordLength(plain);
  return await bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  assertPasswordLength(plain);
  return await bcrypt.compare(plain, hash);
}
`
    }
  ]
}
