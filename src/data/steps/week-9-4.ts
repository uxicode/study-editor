import type { CurriculumStep } from '@/types/curriculum'
import { AUTH_STORE_FILE } from './week-9-shared'

export const week_9_4: CurriculumStep = {
  id: 'week-9-4',
  title: '9주차 · 로그인 폼: react-hook-form + zod 스키마 공유',
  order: 52,
  category: 'advanced',
  content: {
    mission:
      '9-3의 서버가 사용하던 `loginSchema`를 직접 설계하고, 그 스키마로 폼을 검증한 뒤 로그인 API를 호출하는 `useLoginForm` 훅을 완성하세요.\n- `schemas/loginSchema.ts`: 이메일은 `trim()` 후 이메일 형식 검사, 비밀번호는 **trim 하지 않고** 8자 이상 + UTF-8 72바이트 이하\n- `hooks/useLoginForm.ts`: `zodResolver(loginSchema)`로 검증 → `POST /api/auth/login` → 401이면 `setError(\'root\', ...)`\n- 응답에서 토큰을 꺼내 저장하지 마세요. 토큰은 이미 HttpOnly 쿠키에 있습니다.',
    theory: `
## 클라이언트 검증의 역할

| 검증 위치 | 목적 | 우회 가능? |
|-----------|------|-----------|
| 브라우저 (이번 스텝) | 즉각적인 피드백, 불필요한 요청 줄이기 | 가능 (개발자 도구, curl) |
| 서버 (9-3) | **보안**. 실제로 데이터를 지키는 곳 | 불가 |

그래서 **같은 스키마 파일을 클라이언트와 서버가 함께 import** 하는 것이 가장 좋습니다. 규칙이 한 곳에만 있으니 "폼에서는 통과했는데 서버에서 400"이 생기지 않습니다.

## 1. zod 스키마 설계

zod의 기본 문법(\`z.object\`, \`safeParse\`, \`z.infer\`, trim 같은 값 다듬기)은 9-3 이론의 「zod 기초」에서 다뤘습니다. 여기서는 그 문법으로 로그인 규칙을 설계합니다.

\`\`\`ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      '비밀번호가 너무 깁니다.'
    )
});

export type LoginInput = z.infer<typeof loginSchema>; // 타입도 스키마에서 자동 생성
\`\`\`

| 필드 | 규칙 | 이유 |
|------|------|------|
| email | trim + toLowerCase + email | 앞뒤 공백·대소문자 차이로 "가입한 계정을 못 찾는" 문제 방지 |
| password | trim 금지 | 공백도 비밀번호의 일부. 잘라내면 다른 비밀번호가 됨 |
| password | min(8) | 너무 짧은 비밀번호 차단 (NIST 권장 최소 8자) |
| password | 72바이트 이하 | 9-2에서 본 bcrypt 제한과 일치. \`.max(72)\`는 글자 수라 한글에서 틀림 |

> 로그인 폼에서는 "대문자·특수문자 포함" 같은 **복잡도 규칙을 검사하지 않습니다.** 그건 회원가입 때 정할 규칙이고, 로그인에서 검사하면 규칙이 바뀌기 전에 가입한 사용자가 로그인하지 못합니다.

## 2. react-hook-form 기초

### 왜 쓰나?

React로 폼을 직접 만들면 입력마다 \`useState\`와 \`onChange\`를 만들고, 에러 상태·제출 중 상태도 따로 관리해야 합니다. 한 글자 칠 때마다 컴포넌트 전체가 다시 렌더링되기도 합니다.

react-hook-form은 입력값을 React state가 아니라 **DOM의 input 요소에서 직접(ref로) 읽습니다.** 그래서 타이핑할 때 리렌더링이 거의 없고, 검증·에러·제출 상태를 한 곳에서 관리해 줍니다.

\`\`\`bash
npm install react-hook-form zod @hookform/resolvers
\`\`\`

| 패키지 | 역할 |
|--------|------|
| react-hook-form | 폼 상태 관리 (useForm) |
| zod | 검증 규칙(스키마) |
| @hookform/resolvers | 둘을 이어 주는 어댑터 (zodResolver) |

### useForm 이 돌려주는 것

\`\`\`ts
import { useForm } from 'react-hook-form';

const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),        // 검증을 zod 스키마에 맡김
  defaultValues: { email: '', password: '' } // 초기값 (없으면 undefined 로 시작)
});
\`\`\`

\`useForm()\`은 폼을 다루는 함수와 상태를 **하나의 객체**로 묶어 반환합니다. 이 객체의 타입 이름이 \`UseFormReturn\`이고, 라이브러리 안(\`node_modules/react-hook-form/dist/types/form.d.ts\`)에 정의되어 있습니다. 우리가 직접 적지 않아도 TypeScript가 \`form\`의 타입을 자동으로 추론해 줍니다.

| 속성 | 하는 일 | 이 스텝에서 |
|------|---------|-----------|
| register | input을 폼에 연결 | 이메일·비밀번호 input |
| handleSubmit | 검증 후 통과하면 콜백 실행 | onSubmit 만들기 |
| formState | errors, isSubmitting 등 현재 상태 | 에러 메시지, 버튼 비활성화 |
| setError | 에러를 직접 넣기 | 서버 401을 root 에러로 표시 |
| resetField | 특정 필드만 초기화 | 틀린 비밀번호 지우기 |
| reset | 폼 전체 초기화 | (사용 안 함) |
| watch | 입력값 실시간 구독 | (사용 안 함) |

이 표의 \`form.register\`, \`form.handleSubmit\` 같은 것들이 모두 이 반환 객체에서 나옵니다.

### register — input 연결하기

\`\`\`tsx
register('email');
// → { name: 'email', onChange: ƒ, onBlur: ƒ, ref: ƒ }

<input {...register('email')} />
// = <input name="email" onChange={...} onBlur={...} ref={...} />
\`\`\`

\`register('필드명')\`은 input에 붙일 속성 4개를 담은 객체를 돌려주고, 스프레드(\`{...}\`)로 그대로 펼쳐 넣습니다. 필드명은 스키마의 키와 같아야 하며, \`LoginInput\` 타입 덕분에 \`register('emial')\` 같은 오타는 컴파일 에러가 됩니다.

### handleSubmit — 검증을 통과했을 때만 실행

\`\`\`ts
const onSubmit = form.handleSubmit(async (values) => {
  // 여기까지 왔다면 values 는 이미 zod 검증을 통과한 값
});

<form onSubmit={onSubmit}>
\`\`\`

\`\`\`text
제출 버튼 클릭
  └─ handleSubmit
       ├─ event.preventDefault()        (페이지 새로고침 방지)
       ├─ zodResolver 로 전체 값 검증
       │    ├─ 실패 → formState.errors 채움, 콜백 실행 안 함
       │    └─ 성공 → isSubmitting = true → 콜백(values) 실행
       └─ 콜백이 끝나면 isSubmitting = false
\`\`\`

콜백을 \`async\`로 만들면 Promise가 끝날 때까지 \`isSubmitting\`이 \`true\`로 유지됩니다. 그래서 버튼 비활성화를 따로 관리하지 않아도 됩니다.

### formState — 현재 폼 상태

| 값 | 의미 |
|----|------|
| errors.email?.message | email 필드의 에러 메시지 (스키마에 적은 문자열) |
| errors.root?.message | 폼 전체 에러 (setError('root', ...)로 넣은 것) |
| isSubmitting | 제출 콜백 실행 중 여부 |
| isValid / isDirty | 전체 유효 여부 / 초기값에서 바뀌었는지 |

\`formState\`는 **읽은 값만 구독하는** 특수한 객체(Proxy)입니다. 컴포넌트에서 구조 분해로 필요한 값만 꺼내면, 그 값이 바뀔 때만 다시 렌더링됩니다.

\`\`\`ts
const { register, formState: { errors, isSubmitting } } = form;
// 아래 세 줄과 같다 (중첩 구조 분해)
// const register = form.register;
// const errors = form.formState.errors;
// const isSubmitting = form.formState.isSubmitting;
\`\`\`

### zodResolver — 두 라이브러리를 잇는 어댑터

react-hook-form은 원래 \`register('email', { required: true, minLength: 8 })\`처럼 **자체 규칙**으로 검증합니다. \`resolver\` 옵션을 주면 이 규칙 대신 외부 검증 함수를 씁니다. \`zodResolver(loginSchema)\`는 zod 스키마를 그 형식의 함수로 바꿔 주고, zod의 에러 메시지를 \`formState.errors\`로 옮겨 줍니다. 덕분에 규칙은 **스키마 한 곳에만** 있고, 같은 스키마를 서버(9-3)에서도 그대로 씁니다.

## 3. 서버 응답 처리

\`\`\`ts
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(values)
});

if (res.status === 401) {
  form.setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
  form.resetField('password'); // 틀린 비밀번호는 지워 준다
  return;
}
\`\`\`

- **root 에러**: 특정 필드가 아니라 폼 전체에 대한 에러입니다. "이메일이 틀렸다"고 특정하면 9-3에서 막은 사용자 열거가 화면에서 다시 생깁니다.
- 같은 출처(same-origin) 요청이면 fetch는 쿠키를 자동으로 주고받습니다. 서버가 보낸 \`Set-Cookie\`는 브라우저가 알아서 저장합니다.
- 응답 JSON에는 \`user\`만 있습니다. **토큰을 꺼내 저장할 일이 없습니다.**

## 4. 컴포넌트에서 사용하기

\`\`\`tsx
export default function LoginForm() {
  const router = useRouter();
  const { form, onSubmit } = useLoginForm(() => router.replace('/dashboard'));
  const { register, formState: { errors, isSubmitting } } = form;

  return (
    <form method="post" onSubmit={onSubmit} noValidate>
      <input type="email" autoComplete="username" {...register('email')} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <input type="password" autoComplete="current-password" {...register('password')} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      {errors.root && <p role="alert">{errors.root.message}</p>}
      <button type="submit" disabled={isSubmitting}>로그인</button>
    </form>
  );
}
\`\`\`

| 속성 | 이유 |
|------|------|
| method="post" | JS가 로드되기 전에 제출되면 기본값 GET으로 전송되어 **비밀번호가 URL에 노출**됨 (주소창·서버 로그·Referer) |
| type="password" | 화면 노출 방지, 비밀번호 관리자 연동 |
| autoComplete | 비밀번호 관리자가 올바르게 채워 줌. 끄면 사용자가 약한 비밀번호를 쓰게 됨 |
| disabled={isSubmitting} | 더블 클릭 중복 요청 방지 |

## 흔한 실수

- \`console.log(values)\` — 비밀번호가 콘솔과 에러 수집 도구(Sentry 등)에 남습니다.
- 로그인 성공 후 \`localStorage.setItem('token', data.token)\`
- \`import { z } from 'z'\` 같은 잘못된 패키지명 — 패키지 이름은 **zod** 입니다.
    `,
    objectives: [
      '클라이언트 검증은 UX용이고 보안 검증은 서버가 담당한다는 것을 설명할 수 있다',
      '이메일은 정규화하고 비밀번호는 원본 그대로 검증하는 zod 스키마를 작성할 수 있다',
      'useForm이 반환하는 register, handleSubmit, formState, setError의 역할을 설명할 수 있다',
      'zodResolver로 react-hook-form과 zod 스키마를 연결할 수 있다',
      '401 응답을 필드가 아닌 root 에러로 표시해 사용자 열거를 막을 수 있다',
      '폼에 method="post", autoComplete, disabled를 지정하는 이유를 설명할 수 있다'
    ],
    exercise: `
1. \`schemas/loginSchema.ts\`
   - \`email: z.string().trim().toLowerCase().email('올바른 이메일 형식이 아닙니다.')\`
   - \`password: z.string().min(8, ...)\` 뒤에 \`.refine(...)\`로 \`new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES\` 검사
   - \`LoginInput\` 타입을 \`z.infer<typeof loginSchema>\`로 export
2. \`hooks/useLoginForm.ts\`
   - \`useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: ... })\`
   - \`form.handleSubmit(async (values) => { ... })\` 안에서 \`fetch('/api/auth/login', { method: 'POST', headers, body: JSON.stringify(values) })\`
   - \`res.status === 401\`이면 \`form.setError('root', { message })\` 후 \`form.resetField('password')\`
   - 그 밖의 실패(\`!res.ok\`)도 root 에러로 처리하고, 성공하면 \`onSuccess(data.user)\` 호출
3. localStorage, console.log 는 사용하지 마세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'loginSchema.ts',
      path: 'schemas/loginSchema.ts',
      content: `import { z } from 'zod';

const MAX_PASSWORD_BYTES = 72;

// TODO: 클라이언트와 서버가 함께 쓰는 loginSchema 를 정의하세요.
export const loginSchema = z.object({});

export type LoginInput = z.infer<typeof loginSchema>;
`,
      language: 'typescript'
    },
    {
      name: 'useLoginForm.ts',
      path: 'hooks/useLoginForm.ts',
      content: `'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/loginSchema';
import type { AuthUser } from '@/stores/authStore';

interface LoginResponse {
  user: AuthUser;
}

export function useLoginForm(onSuccess: (user: AuthUser) => void) {
  // TODO 1: useForm 에 zodResolver(loginSchema) 연결

  // TODO 2: handleSubmit 으로 감싼 onSubmit 에서 POST /api/auth/login 호출
  //         401 → setError('root') + resetField('password'), 기타 실패 → setError('root'), 성공 → onSuccess(data.user)

  return {};
}
`,
      language: 'typescript'
    },
    AUTH_STORE_FILE
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'schemas/loginSchema.ts',
        pattern: /email:\s*z\s*\.string\(\)\s*\.trim\(\)/,
        message: 'email은 z.string().trim()으로 앞뒤 공백을 제거한 뒤 검증하세요.'
      },
      {
        type: 'regex',
        target: 'schemas/loginSchema.ts',
        pattern: /\.email\(/,
        message: 'email 필드에 .email(\'올바른 이메일 형식이 아닙니다.\') 형식 검사를 추가하세요.'
      },
      {
        type: 'regex',
        target: 'schemas/loginSchema.ts',
        pattern: /password:\s*z\s*\.string\(\)\s*\.min\(\s*8/,
        message: 'password는 z.string().min(8, ...)으로 시작하세요. 비밀번호에는 trim()을 쓰지 않습니다.'
      },
      {
        type: 'regex',
        target: 'schemas/loginSchema.ts',
        pattern: /\.refine\([\s\S]*new\s+TextEncoder\(\)\.encode\([\s\S]*\)\.length\s*<=\s*MAX_PASSWORD_BYTES/,
        message: 'password에 .refine()으로 new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES 검사를 추가하세요. .max(72)는 글자 수 기준이라 한글에서 틀립니다.'
      },
      {
        type: 'regex',
        target: 'schemas/loginSchema.ts',
        pattern: /^(?![\s\S]*password:[^,}]*\.trim\(\))[\s\S]*$/,
        message: '비밀번호에는 trim()을 적용하지 마세요. 공백도 비밀번호의 일부입니다.'
      },
      {
        type: 'includes',
        target: 'hooks/useLoginForm.ts',
        pattern: 'zodResolver(loginSchema)',
        message: 'useForm의 resolver에 zodResolver(loginSchema)를 연결하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /handleSubmit\(\s*async/,
        message: 'form.handleSubmit(async (values) => { ... })로 검증을 통과했을 때만 요청을 보내세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /fetch\(\s*['"`]\/api\/auth\/login['"`]/,
        message: "fetch('/api/auth/login', ...)으로 로그인 API를 호출하세요."
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /method:\s*['"]POST['"]/,
        message: "로그인 요청은 method: 'POST'로 보내야 합니다. GET이면 비밀번호가 URL에 남습니다."
      },
      {
        type: 'includes',
        target: 'hooks/useLoginForm.ts',
        pattern: 'JSON.stringify(values)',
        message: 'body에 JSON.stringify(values)로 검증된 값을 담으세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /status\s*===\s*401/,
        message: 'res.status === 401(인증 실패)을 따로 처리하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /setError\(\s*['"]root['"]/,
        message: "인증 실패는 특정 필드가 아니라 form.setError('root', { message })로 표시하세요."
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /resetField\(\s*['"]password['"]\s*\)/,
        message: "로그인 실패 시 form.resetField('password')로 틀린 비밀번호를 지워 주세요."
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /onSuccess\(\s*data\.user\s*\)/,
        message: '로그인 성공 시 onSuccess(data.user)를 호출하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /^(?![\s\S]*(localStorage|sessionStorage))[\s\S]*$/,
        message: '토큰이나 사용자 정보를 localStorage/sessionStorage에 저장하지 마세요. 토큰은 HttpOnly 쿠키에 있습니다.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginForm.ts',
        pattern: /^(?![\s\S]*console\.log\()[\s\S]*$/,
        message: 'console.log를 지우세요. 입력값(비밀번호)이 콘솔과 에러 수집 도구에 남을 수 있습니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '스키마는 `z.object({ email: z.string().trim().toLowerCase().email(\'...\'), password: z.string().min(8, \'...\').refine((value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES, \'...\') })` 형태입니다.'
    },
    {
      level: 2,
      content: '훅에서는 `const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: \'\', password: \'\' } });`를 만들고, `const onSubmit = form.handleSubmit(async (values) => { ... });`를 반환값 `{ form, onSubmit }`에 담으세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다. (두 파일에 함께 적용됩니다)',
      codeSnippet: `// @file: schemas/loginSchema.ts
import { z } from 'zod';

const MAX_PASSWORD_BYTES = 72;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('올바른 이메일 형식이 아닙니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .refine(
      (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
      '비밀번호가 너무 깁니다.'
    )
});

export type LoginInput = z.infer<typeof loginSchema>;

// @file: hooks/useLoginForm.ts
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/schemas/loginSchema';
import type { AuthUser } from '@/stores/authStore';

interface LoginResponse {
  user: AuthUser;
}

export function useLoginForm(onSuccess: (user: AuthUser) => void) {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (res.status === 401) {
      form.setError('root', { message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      form.resetField('password');
      return;
    }
    if (!res.ok) {
      form.setError('root', { message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' });
      return;
    }

    const data: LoginResponse = await res.json();
    onSuccess(data.user);
  });

  return { form, onSubmit };
}
`
    }
  ]
}
