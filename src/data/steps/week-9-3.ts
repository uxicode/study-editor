import type { CurriculumStep } from '@/types/curriculum'
import { AUTH_CONFIG_FILE, LOGIN_SCHEMA_FILE, PASSWORD_FILE, USERS_FILE } from './week-9-shared'

export const week_9_3: CurriculumStep = {
  id: 'week-9-3',
  title: '9주차 · 로그인 API: 검증 → 비교 → 토큰 발급 → 쿠키',
  order: 51,
  category: 'advanced',
  content: {
    mission:
      '`app/api/auth/login/route.ts`의 `POST` 핸들러를 완성하세요.\n- `loginSchema.safeParse(body)` 실패 시 **400**\n- 사용자가 없어도 `verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)`를 **항상** 호출\n- 사용자가 없거나 비밀번호가 틀리면 똑같이 **401** + `"이메일 또는 비밀번호가 올바르지 않습니다."`\n- 성공 시 `jose`의 `SignJWT`로 15분짜리 액세스 토큰을 서명하고, **응답 본문이 아니라 HttpOnly 쿠키**로만 내려주세요.',
    theory: `
## 로그인 API가 하는 일

\`\`\`text
POST /api/auth/login  { email, password }
  │
  ├─ ① 입력 검증 (zod)            실패 → 400
  ├─ ② 사용자 조회 (email)
  ├─ ③ 비밀번호 비교 (bcrypt)      ← 사용자가 없어도 반드시 실행
  ├─ ④ ②·③ 중 하나라도 실패        → 401 (같은 메시지)
  ├─ ⑤ 액세스 토큰 서명 (JWT, 15분)
  └─ ⑥ Set-Cookie: HttpOnly; Secure; SameSite=Lax  →  200 { user }
\`\`\`

## ① 서버에서도 반드시 다시 검증

브라우저 검증(다음 스텝)은 **UX를 위한 것**이고, 공격자는 curl로 아무 값이나 보낼 수 있습니다. 서버는 항상 직접 검증합니다. 이 검증에 쓰는 도구가 **zod**입니다.

## zod 기초

### 왜 TypeScript 타입만으로는 안 될까?

TypeScript 타입은 **컴파일할 때만 존재하고 실행할 때는 사라집니다.** 그래서 외부에서 들어온 값이 타입과 맞는지는 TypeScript가 확인해 주지 못합니다.

\`\`\`ts
interface LoginBody { email: string; password: string }

const body = (await request.json()) as LoginBody; // "그렇다고 믿겠다"는 선언일 뿐
body.email.trim(); // 실제로 { email: 123 } 이 오면 실행 중 에러
\`\`\`

zod는 **실행 중에 값을 직접 검사하는 스키마**를 만들고, 그 스키마에서 TypeScript 타입까지 뽑아 줍니다. 규칙과 타입을 한 번만 적으면 됩니다.

\`\`\`bash
npm install zod
\`\`\`

### 1. 스키마 만들기

\`\`\`ts
import { z } from 'zod'; // 패키지 이름은 'zod', 꺼내 쓰는 이름은 z

const userSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  age: z.number().int().min(14, '14세 이상만 가입할 수 있습니다.'),
  role: z.enum(['USER', 'ADMIN']),
  nickname: z.string().max(20).optional()
});
\`\`\`

| 메서드 | 검사 내용 |
|--------|----------|
| z.string() / z.number() / z.boolean() | 기본 자료형 |
| z.object({ ... }) | 객체와 각 필드의 규칙 |
| z.enum([...]) | 정해진 값 중 하나 |
| .min(n, 메시지) / .max(n, 메시지) | 문자열이면 글자 수, 숫자면 값의 크기 |
| .email() | 이메일 형식 |
| .optional() | 값이 없어도(undefined) 통과 |
| .refine(함수, 메시지) | 기본 메서드로 안 되는 규칙을 직접 작성 (true면 통과) |

두 번째 인자로 넘긴 문자열이 실패했을 때의 에러 메시지가 됩니다.

### 2. 검사하기: parse vs safeParse

\`\`\`ts
userSchema.parse(input);      // 성공 → 값 반환, 실패 → 예외(ZodError)를 던짐

const result = userSchema.safeParse(input); // 예외 없이 결과 객체를 반환
if (result.success) {
  result.data;                 // 검증을 통과한 값 (타입도 정확함)
} else {
  result.error.issues;         // [{ path: ['email'], message: '올바른 이메일 형식이 아닙니다.' }, ...]
}
\`\`\`

| 구분 | parse | safeParse |
|---|---|---|
| 실패 시 | 예외 발생 | { success: false, error } |
| 어울리는 곳 | 실패하면 안 되는 내부 값 (환경 변수 등) | **외부 입력** (요청 본문, 쿼리, 폼) |

요청 처리에서 \`parse()\`를 쓰면 잘못된 입력 하나로 예외가 던져져 **500 에러**가 되기 쉽습니다. 외부 입력에는 \`safeParse()\`를 쓰고 실패하면 400으로 응답하세요.

### 3. 값 다듬기: trim, toLowerCase

\`\`\`ts
z.string().trim().toLowerCase().email()
// 입력 '  Alice@Example.COM ' → result.data.email === 'alice@example.com'
\`\`\`

이런 메서드는 검사만 하는 게 아니라 **값을 바꿔서** \`result.data\`에 넣어 줍니다. 그래서 원본 \`body\`가 아니라 반드시 \`result.data\`를 써야 합니다.

### 4. 타입 뽑아내기: z.infer

\`\`\`ts
type User = z.infer<typeof userSchema>;
// { email: string; age: number; role: 'USER' | 'ADMIN'; nickname?: string }
\`\`\`

\`typeof userSchema\`는 스키마 객체의 타입이고, \`z.infer<...>\`는 거기서 "검증을 통과한 값의 타입"을 계산합니다. interface를 따로 쓰지 않아도 됩니다.

> zod 4부터는 \`z.email()\`처럼 최상위 함수로도 쓸 수 있습니다. 이 실습의 \`z.string().email()\` 문법은 zod 3과 4 모두에서 동작합니다.

### 로그인 API에 적용

이 스텝에서는 \`schemas/loginSchema.ts\`(읽기 전용)에 미리 만들어 둔 스키마를 사용합니다. 다음 스텝에서 이 스키마를 직접 설계하고, **같은 파일을 폼에서도 import 해서** 클라이언트와 서버 규칙을 하나로 맞춥니다.

\`\`\`ts
const body = await request.json().catch(() => null); // 깨진 JSON → null (예외 방지)
const parsed = loginSchema.safeParse(body);
if (!parsed.success) {
  return NextResponse.json({ message: '입력값을 확인해 주세요.' }, { status: 400 });
}
const { email, password } = parsed.data;           // 다듬어진 값만 사용
\`\`\`

400 응답에 \`parsed.error\`를 그대로 담지 마세요. 어떤 규칙으로 검사하는지 외부에 알려 줄 필요는 없습니다.

## ②~④ 사용자 열거(User Enumeration) 막기

| 응답 | 공격자가 알게 되는 것 |
|------|---------------------|
| "존재하지 않는 이메일입니다" | 이 이메일은 가입 안 됨 |
| "비밀번호가 틀렸습니다" | 이 이메일은 **가입되어 있음** → 대입 공격 대상 확정 |
| "이메일 또는 비밀번호가 올바르지 않습니다" | 아무것도 모름 |

메시지만 같아서는 부족합니다. 사용자가 없을 때 bcrypt 비교를 건너뛰면 **응답이 100ms 이상 빨라져서** 시간만 재도 가입 여부가 드러납니다. 그래서 사용자가 없을 때도 미리 만들어 둔 더미 해시와 비교해 **항상 같은 비용**을 치르게 합니다.

\`\`\`ts
const user = await findUserByEmail(email);
const isValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
if (!user || !isValid) return NextResponse.json({ message: INVALID_CREDENTIALS }, { status: 401 });
\`\`\`

> 실서비스에서는 여기에 **로그인 시도 제한(rate limit)**을 더해 같은 IP·계정의 반복 실패에 429 Too Many Requests를 돌려줍니다.

## ⑤ JWT 서명 (jose)

Next.js의 미들웨어는 Edge 런타임에서 돌기 때문에 Node 전용인 \`jsonwebtoken\` 대신 Web Crypto 기반의 **jose**를 씁니다. 발급과 검증에 같은 라이브러리를 쓰면 설정이 어긋나지 않습니다.

\`\`\`ts
import { SignJWT } from 'jose';

const token = await new SignJWT({ role: user.role }) // 공개되어도 되는 정보만
  .setProtectedHeader({ alg: 'HS256' })
  .setSubject(user.id)          // sub: 토큰의 주인
  .setIssuedAt()                // iat: 발급 시각
  .setExpirationTime('900s')    // exp: 15분 뒤 만료
  .sign(getJwtSecret());        // 환경 변수에서 읽은 비밀키
\`\`\`

| 규칙 | 이유 |
|------|------|
| 비밀키는 환경 변수 (32자 이상 무작위) | 코드에 하드코딩하면 Git에 남고, 누구나 토큰을 위조할 수 있음 |
| 짧은 만료 (5~15분) | JWT는 만료 전 강제 무효화가 어려움 → 피해 시간을 줄임 |
| 페이로드는 최소한 (sub, role) | 누구나 디코딩 가능 |

## ⑥ 토큰은 쿠키로만

\`\`\`ts
const response = NextResponse.json({ user: { id: user.id, email: user.email } });
response.cookies.set(ACCESS_TOKEN_COOKIE, token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: ACCESS_TOKEN_TTL_SEC
});
return response;
\`\`\`

응답 JSON에 \`{ token }\`을 함께 넣으면 프론트엔드 코드가 그것을 어딘가(대개 localStorage)에 저장하게 되고, HttpOnly 쿠키를 쓴 의미가 사라집니다. 브라우저는 쿠키를 **자동으로** 다음 요청에 붙이므로 프론트엔드는 토큰을 몰라도 됩니다.

## 흔한 실수

- \`if (password === user.password)\` — 9-2에서 배운 대로 DB에는 평문이 없어야 하고, 비교는 bcrypt.compare만 씁니다.
- \`sign(payload, 'my-secret')\` 처럼 비밀키 하드코딩
- 실패 사유를 친절하게 구분해서 응답
- 예외 메시지(\`error.message\`)를 그대로 응답에 포함 — DB 구조 등 내부 정보가 노출됩니다.
    `,
    objectives: [
      'TypeScript 타입만으로는 실행 중 입력을 검증할 수 없는 이유를 설명할 수 있다',
      'zod로 스키마를 만들고 parse와 safeParse의 차이를 구분해 사용할 수 있다',
      '클라이언트 검증과 별개로 서버에서 zod safeParse로 입력을 다시 검증할 수 있다',
      '동일한 실패 메시지와 더미 해시 비교로 사용자 열거 공격을 막을 수 있다',
      'jose의 SignJWT로 만료 시간이 있는 액세스 토큰을 서명할 수 있다',
      '비밀키를 하드코딩하지 않고 환경 변수에서 읽어야 하는 이유를 설명할 수 있다',
      '토큰을 응답 본문이 아닌 HttpOnly 쿠키로만 전달할 수 있다'
    ],
    exercise: `
1. \`request.json()\`을 \`.catch(() => null)\`로 감싸고 \`loginSchema.safeParse(body)\`로 검증하세요. 실패하면 \`{ status: 400 }\`.
2. \`findUserByEmail(email)\`로 사용자를 찾고, **사용자 유무와 관계없이** \`verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)\`를 호출하세요.
3. \`!user || !isValid\`이면 \`INVALID_CREDENTIALS\` 메시지와 \`{ status: 401 }\`로 응답하세요.
4. \`new SignJWT({ role: user.role })\` → \`setProtectedHeader({ alg: 'HS256' })\` → \`setSubject(user.id)\` → \`setIssuedAt()\` → \`setExpirationTime(...)\` → \`sign(getJwtSecret())\`
5. \`NextResponse.json({ user: { id, email } })\`를 만들고 \`response.cookies.set(ACCESS_TOKEN_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: ACCESS_TOKEN_TTL_SEC })\` 후 반환하세요.
6. 읽기 전용 파일(\`lib/auth-config.ts\`, \`lib/users.ts\`, \`lib/password.ts\`, \`schemas/loginSchema.ts\`)은 수정하지 않습니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'route.ts',
      path: 'app/api/auth/login/route.ts',
      content: `import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { loginSchema } from '@/schemas/loginSchema';
import { findUserByEmail, DUMMY_PASSWORD_HASH } from '@/lib/users';
import { verifyPassword } from '@/lib/password';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SEC, getJwtSecret } from '@/lib/auth-config';

const INVALID_CREDENTIALS = '이메일 또는 비밀번호가 올바르지 않습니다.';

export async function POST(request: Request) {
  // ① 입력 검증 (실패 시 400)

  // ② 사용자 조회 + ③ 비밀번호 비교 (사용자가 없어도 DUMMY_PASSWORD_HASH 로 비교)

  // ④ 실패 시 401 + INVALID_CREDENTIALS

  // ⑤ SignJWT 로 액세스 토큰 서명

  // ⑥ 토큰은 HttpOnly 쿠키로만 설정하고 본문에는 user 만 담아 반환
  return NextResponse.json({ message: 'TODO' }, { status: 501 });
}
`,
      language: 'typescript'
    },
    LOGIN_SCHEMA_FILE,
    USERS_FILE,
    PASSWORD_FILE,
    AUTH_CONFIG_FILE
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app/api/auth/login/route.ts',
        pattern: 'loginSchema.safeParse(',
        message: '서버에서도 loginSchema.safeParse(body)로 입력을 다시 검증하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /status:\s*400/,
        message: '입력 검증에 실패하면 { status: 400 }으로 응답하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /verifyPassword\([^)]*\?\?\s*DUMMY_PASSWORD_HASH/,
        message: '사용자가 없어도 verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH)를 호출해 응답 시간을 같게 만드세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /!user\s*\|\|\s*!\w+|!\w+\s*\|\|\s*!user/,
        message: '사용자가 없는 경우와 비밀번호가 틀린 경우를 하나의 조건(!user || !isValid)으로 묶어 처리하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /\{\s*message:\s*INVALID_CREDENTIALS\s*\}\s*,\s*\{\s*status:\s*401\s*\}/,
        message: '인증 실패는 { message: INVALID_CREDENTIALS }, { status: 401 }로 응답하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /^(?![\s\S]*(존재하지 않|가입되지 않|없는 사용자|없는 이메일|비밀번호가 틀|비밀번호가 일치하지))[\s\S]*$/,
        message: '실패 사유를 구분하는 메시지(존재하지 않는 이메일, 비밀번호 불일치 등)는 가입 여부를 노출합니다. INVALID_CREDENTIALS 하나만 사용하세요.'
      },
      {
        type: 'includes',
        target: 'app/api/auth/login/route.ts',
        pattern: 'new SignJWT(',
        message: 'jose의 new SignJWT(...)로 액세스 토큰을 만드세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /\.setExpirationTime\(/,
        message: '토큰에 setExpirationTime(...)으로 만료 시간을 설정하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /\.sign\(\s*getJwtSecret\(\)\s*\)/,
        message: '비밀키는 하드코딩하지 말고 .sign(getJwtSecret())으로 환경 변수에서 읽어 서명하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /cookies\.set\(\s*ACCESS_TOKEN_COOKIE/,
        message: 'response.cookies.set(ACCESS_TOKEN_COOKIE, token, {...})로 토큰을 쿠키에 담으세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /httpOnly:\s*true/,
        message: '쿠키 옵션에 httpOnly: true를 지정하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /secure:\s*true/,
        message: '쿠키 옵션에 secure: true를 지정하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /sameSite:\s*['"](lax|strict)['"]/,
        message: "쿠키 옵션에 sameSite: 'lax'를 지정하세요."
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /^(?![\s\S]*NextResponse\.json\(\s*\{[^)]*\b(?:token|accessToken|jwt)\b)[\s\S]*$/,
        message: '응답 본문(JSON)에 토큰을 넣지 마세요. 토큰은 HttpOnly 쿠키로만 전달합니다.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /^(?![\s\S]*password\w*\s*[!=]==?(?!>))(?![\s\S]*[!=]==?\s*[\w.?]*password)[\s\S]*$/i,
        message: '비밀번호를 ===로 직접 비교하지 마세요. verifyPassword(bcrypt.compare)만 사용합니다.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/login/route.ts',
        pattern: /^(?![\s\S]*\.sign\(\s*(?:new\s+TextEncoder\(\)\.encode\(\s*)?['"`])[\s\S]*$/,
        message: '비밀키 문자열을 코드에 직접 쓰지 마세요. getJwtSecret()을 사용합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '흐름은 `safeParse` → `findUserByEmail` → `verifyPassword(..., user?.passwordHash ?? DUMMY_PASSWORD_HASH)` → `if (!user || !isValid) 401` 순서입니다. 비교를 if 안으로 숨기면 사용자가 없을 때 비교가 생략되니 주의하세요.'
    },
    {
      level: 2,
      content: '쿠키는 `const response = NextResponse.json({ user: { id: user.id, email: user.email } });` 를 먼저 만든 뒤 `response.cookies.set(ACCESS_TOKEN_COOKIE, token, { httpOnly: true, secure: true, sameSite: \'lax\', path: \'/\', maxAge: ACCESS_TOKEN_TTL_SEC })`로 설정하고 `return response;` 합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { loginSchema } from '@/schemas/loginSchema';
import { findUserByEmail, DUMMY_PASSWORD_HASH } from '@/lib/users';
import { verifyPassword } from '@/lib/password';
import { ACCESS_TOKEN_COOKIE, ACCESS_TOKEN_TTL_SEC, getJwtSecret } from '@/lib/auth-config';

const INVALID_CREDENTIALS = '이메일 또는 비밀번호가 올바르지 않습니다.';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요.' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  const isValid = await verifyPassword(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);

  if (!user || !isValid) {
    return NextResponse.json({ message: INVALID_CREDENTIALS }, { status: 401 });
  }

  const accessToken = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(\`\${ACCESS_TOKEN_TTL_SEC}s\`)
    .sign(getJwtSecret());

  const response = NextResponse.json({ user: { id: user.id, email: user.email } });
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SEC
  });
  return response;
}
`
    }
  ]
}
