import type { CurriculumStep } from '@/types/curriculum'
import { AUTH_CONFIG_FILE, AUTH_STORE_FILE, LOGIN_FORM_HOOK_FILE, SESSIONS_FILE } from './week-9-shared'

export const week_9_final: CurriculumStep = {
  id: 'week-9-final',
  title: '9주차 종합 · 로그인 → 원래 페이지 복귀 → 로그아웃',
  order: 56,
  category: 'advanced',
  content: {
    mission:
      '지금까지 만든 조각을 이어 인증 흐름을 완성하세요.\n- `lib/safe-redirect.ts`: `?from=` 값이 **우리 사이트 내부 경로일 때만** 돌려주는 `getSafeRedirect(from)` (그 외에는 `/dashboard`)\n- `hooks/useLoginSubmit.ts`: 로그인 성공 시 `setUser(user)` 후 `router.replace(getSafeRedirect(searchParams.get(\'from\')))`\n- `app/api/auth/logout/route.ts`: **POST만** 허용. 리프레시 토큰을 서버에서 폐기(`revokeRefreshToken`)하고 두 쿠키를 모두 삭제',
    theory: `
## 완성되는 흐름

\`\`\`text
① 비로그인으로 /settings/profile 접근
   └─ middleware(9-5): 토큰 없음 → 302 /login?from=%2Fsettings%2Fprofile
② 로그인 폼 제출 (9-4) → POST /api/auth/login (9-3) → Set-Cookie
③ useLoginSubmit: setUser(user) → router.replace(getSafeRedirect(from))  ← 이번 스텝
④ /settings/profile 정상 표시. API 401 은 apiFetch(9-6)가 조용히 갱신
⑤ 로그아웃: POST /api/auth/logout → 서버에서 세션 폐기 + 쿠키 삭제  ← 이번 스텝
\`\`\`

## 1. 오픈 리다이렉트(Open Redirect)

로그인 후 \`from\`으로 이동시키는 기능은 그대로 두면 피싱 도구가 됩니다.

\`\`\`text
https://우리서비스.com/login?from=https://우리서비스-login.evil.com
\`\`\`

사용자는 진짜 도메인에서 로그인했으니 안심하는데, 로그인 직후 공격자의 가짜 페이지로 이동해 "세션이 만료되었습니다. 다시 로그인해 주세요"를 보게 됩니다. 이렇게 두 번째로 입력한 비밀번호가 탈취됩니다.

### 단순 검사로는 부족한 이유

| 입력 | startsWith('/') | 브라우저가 실제로 가는 곳 |
|------|----------------|------------------------|
| /settings | true | 우리 사이트 |
| //evil.com | **true** | evil.com (프로토콜 상대 URL) |
| /\\evil.com | **true** | evil.com (브라우저가 \\ 를 / 로 바꿈) |
| javascript:alert(1) | false | 스크립트 실행 |

직접 문자열 규칙을 늘려 가는 대신, **브라우저와 같은 규칙으로 해석하는 URL 파서**에 맡기고 출처(origin)만 비교하는 것이 가장 안전합니다.

\`\`\`ts
const BASE = 'http://internal.invalid';            // 임의의 기준 출처
const url = new URL('//evil.com', BASE);
url.origin;                                       // 'http://evil.com' → 다르다 → 거부

const ok = new URL('/settings?tab=1', BASE);
ok.origin === BASE;                               // true
ok.pathname + ok.search + ok.hash;                // '/settings?tab=1'
\`\`\`

추가로 \`/login\`으로 돌려보내면 로그인 직후 다시 로그인 화면이 뜨므로 기본 경로로 바꿉니다.

## 2. 로그인 성공 처리

\`\`\`ts
const router = useRouter();
const searchParams = useSearchParams();
const setUser = useAuthStore((state) => state.setUser);

return useLoginForm((user) => {
  setUser(user);                                            // 화면용 사용자 정보만
  router.replace(getSafeRedirect(searchParams.get('from'))); // 뒤로가기로 로그인 화면에 안 돌아오게
  router.refresh();                                         // 서버 컴포넌트가 새 쿠키로 다시 렌더링
});
\`\`\`

- \`push\`가 아니라 **\`replace\`**: 뒤로 가기를 눌렀을 때 로그인 폼이 다시 나오지 않습니다.
- \`useSearchParams\`를 쓰는 페이지는 \`<Suspense>\`로 감싸야 빌드 시 정적 렌더링 오류가 나지 않습니다.

## 3. 로그아웃은 서버에서 끝내야 한다

| 잘못된 로그아웃 | 문제 |
|----------------|------|
| 스토어만 \`clearUser()\` | 쿠키가 살아 있어 새로고침하면 다시 로그인 상태 |
| 쿠키만 삭제 | 탈취된 리프레시 토큰은 서버에서 여전히 유효 |
| \`GET /logout\` | \`<img src="/api/auth/logout">\` 하나로 강제 로그아웃(CSRF) |

\`\`\`ts
export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken); // 서버 세션 폐기

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {          // 발급할 때와 같은 Path 로 삭제
    httpOnly: true, secure: true, sameSite: 'lax', path: REFRESH_TOKEN_PATH, maxAge: 0
  });
  return response;
}
\`\`\`

9-1에서 본 것처럼 **쿠키는 이름과 Path가 모두 같아야 지워집니다.** 리프레시 토큰은 \`/api/auth/refresh\` 경로로 발급했으므로 삭제할 때도 같은 Path를 지정해야 합니다.

## 9주차 보안 체크리스트

| 항목 | 스텝 |
|------|------|
| 토큰은 HttpOnly; Secure; SameSite=Lax 쿠키에만 | 9-1, 9-3 |
| 비밀번호는 bcrypt 해시로 저장, compare로만 비교 | 9-2 |
| 72바이트 제한, 비밀번호 trim 금지 | 9-2, 9-4 |
| 실패 메시지 통일 + 더미 해시로 응답 시간 통일 | 9-3 |
| 비밀키는 환경 변수, 짧은 만료 | 9-3 |
| 서버에서 입력 재검증 | 9-3 |
| 미들웨어에서 서명 검증, 데이터 계층에서 재확인 | 9-5 |
| 갱신은 single-flight, 재시도는 한 번 | 9-6 |
| OAuth는 state + PKCE, client_secret은 서버에만 | 9-7 |
| 리다이렉트 대상은 같은 출처만 | 종합 |
| 로그아웃은 POST + 서버 세션 폐기 + 쿠키 Path 일치 | 종합 |
    `,
    objectives: [
      '오픈 리다이렉트 공격을 설명하고 URL 파서로 같은 출처 경로만 허용할 수 있다',
      '로그인 성공 시 사용자 정보만 스토어에 저장하고 router.replace로 복귀시킬 수 있다',
      '로그아웃을 POST로만 받고 서버 세션을 폐기해야 하는 이유를 설명할 수 있다',
      '쿠키 삭제 시 발급할 때와 같은 Path를 지정할 수 있다',
      '9주차에서 다룬 인증 보안 항목을 체크리스트로 점검할 수 있다'
    ],
    exercise: `
1. \`lib/safe-redirect.ts\` — \`getSafeRedirect(from)\`
   - \`from\`이 없거나 \`'/'\`로 시작하지 않으면 \`DEFAULT_REDIRECT\`
   - \`const url = new URL(from, BASE_ORIGIN)\` 후 \`url.origin !== BASE_ORIGIN\`이면 \`DEFAULT_REDIRECT\`
   - \`url.pathname\`이 \`'/login'\`으로 시작하면 \`DEFAULT_REDIRECT\`
   - 통과하면 \`url.pathname + url.search + url.hash\` 반환
2. \`hooks/useLoginSubmit.ts\` — \`useLoginForm((user) => { ... })\` 콜백에서 \`setUser(user)\`, \`router.replace(getSafeRedirect(searchParams.get('from')))\`, \`router.refresh()\`
3. \`app/api/auth/logout/route.ts\` — \`export async function POST\`만 두고
   - \`REFRESH_TOKEN_COOKIE\`가 있으면 \`await revokeRefreshToken(...)\`
   - \`response.cookies.delete(ACCESS_TOKEN_COOKIE)\`
   - \`response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ..., path: REFRESH_TOKEN_PATH, maxAge: 0 })\`
    `.trim()
  },
  initialFiles: [
    {
      name: 'safe-redirect.ts',
      path: 'lib/safe-redirect.ts',
      content: `export const DEFAULT_REDIRECT = '/dashboard';

// URL 파서가 상대 경로를 해석할 때 쓰는 임의의 기준 출처. 실제로 요청하지 않는다.
const BASE_ORIGIN = 'http://internal.invalid';

/**
 * 로그인 후 이동할 경로를 결정한다.
 * 같은 출처의 내부 경로만 허용하고, 그 외에는 DEFAULT_REDIRECT 를 반환한다.
 */
export function getSafeRedirect(from: string | null): string {
  // TODO
  return from ?? DEFAULT_REDIRECT;
}
`,
      language: 'typescript'
    },
    {
      name: 'useLoginSubmit.ts',
      path: 'hooks/useLoginSubmit.ts',
      content: `'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useAuthStore } from '@/stores/authStore';
import { getSafeRedirect } from '@/lib/safe-redirect';

export function useLoginSubmit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  return useLoginForm((user) => {
    // TODO: 사용자 정보 저장 → 안전한 경로로 replace → refresh
  });
}
`,
      language: 'typescript'
    },
    {
      name: 'route.ts',
      path: 'app/api/auth/logout/route.ts',
      content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_PATH } from '@/lib/auth-config';
import { revokeRefreshToken } from '@/lib/sessions';

// TODO: POST 핸들러만 export 하세요. (GET 로그아웃은 CSRF 로 강제 실행될 수 있습니다)
`,
      language: 'typescript'
    },
    LOGIN_FORM_HOOK_FILE,
    AUTH_STORE_FILE,
    AUTH_CONFIG_FILE,
    SESSIONS_FILE
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'lib/safe-redirect.ts',
        pattern: /new\s+URL\(\s*from\s*,\s*BASE_ORIGIN\s*\)/,
        message: 'new URL(from, BASE_ORIGIN)으로 브라우저와 같은 규칙으로 경로를 해석하세요.'
      },
      {
        type: 'regex',
        target: 'lib/safe-redirect.ts',
        pattern: /\.origin\s*!==\s*BASE_ORIGIN|BASE_ORIGIN\s*!==\s*\w+\.origin/,
        message: 'url.origin !== BASE_ORIGIN이면 외부 주소이므로 DEFAULT_REDIRECT를 반환하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginSubmit.ts',
        pattern: /setUser\(\s*user\s*\)/,
        message: '로그인 성공 콜백에서 setUser(user)로 화면용 사용자 정보를 저장하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginSubmit.ts',
        pattern: /router\.replace\(\s*getSafeRedirect\(\s*searchParams\.get\(\s*['"]from['"]\s*\)\s*\)\s*\)/,
        message: "router.replace(getSafeRedirect(searchParams.get('from')))로 검증된 경로로만 이동하세요."
      },
      {
        type: 'includes',
        target: 'hooks/useLoginSubmit.ts',
        pattern: 'router.refresh()',
        message: 'router.refresh()로 서버 컴포넌트가 새 쿠키 기준으로 다시 렌더링되게 하세요.'
      },
      {
        type: 'regex',
        target: 'hooks/useLoginSubmit.ts',
        pattern: /^(?![\s\S]*(localStorage|sessionStorage|router\.push\(\s*searchParams))[\s\S]*$/,
        message: 'localStorage를 쓰거나 from 값을 검증 없이 router.push에 넘기지 마세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /export\s+async\s+function\s+POST\s*\(/,
        message: '로그아웃은 export async function POST(request)로만 처리하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /^(?![\s\S]*function\s+GET\b)(?![\s\S]*export\s+const\s+GET\b)[\s\S]*$/,
        message: 'GET 로그아웃은 <img src>나 링크로 강제 실행될 수 있습니다(CSRF). GET 핸들러를 제거하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /request\.cookies\.get\(\s*REFRESH_TOKEN_COOKIE\s*\)/,
        message: 'request.cookies.get(REFRESH_TOKEN_COOKIE)로 폐기할 리프레시 토큰을 읽으세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /await\s+revokeRefreshToken\(/,
        message: '쿠키만 지우면 탈취된 리프레시 토큰이 서버에서 계속 유효합니다. await revokeRefreshToken(...)으로 서버 세션을 폐기하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /cookies\.delete\(\s*ACCESS_TOKEN_COOKIE\s*\)/,
        message: 'response.cookies.delete(ACCESS_TOKEN_COOKIE)로 액세스 토큰 쿠키를 삭제하세요.'
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /cookies\.set\(\s*REFRESH_TOKEN_COOKIE\s*,\s*['"]{2}\s*,\s*\{[\s\S]*?path:\s*REFRESH_TOKEN_PATH[\s\S]*?\}/,
        message: "리프레시 토큰 쿠키는 발급할 때와 같은 Path로 지워야 합니다. cookies.set(REFRESH_TOKEN_COOKIE, '', { path: REFRESH_TOKEN_PATH, maxAge: 0, ... })"
      },
      {
        type: 'regex',
        target: 'app/api/auth/logout/route.ts',
        pattern: /cookies\.set\(\s*REFRESH_TOKEN_COOKIE[\s\S]*?maxAge:\s*0/,
        message: '리프레시 토큰 쿠키 옵션에 maxAge: 0을 지정해 즉시 만료시키세요.'
      }
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'lib/safe-redirect.ts',
        functionName: 'getSafeRedirect',
        cases: [
          { description: '내부 경로 + 쿼리 유지', args: ['/settings/profile?tab=security'], expected: '/settings/profile?tab=security' },
          { description: 'from 없음', args: [null], expected: '/dashboard' },
          { description: '빈 문자열', args: [''], expected: '/dashboard' },
          { description: '외부 절대 URL', args: ['https://evil.com/login'], expected: '/dashboard' },
          { description: '프로토콜 상대 URL', args: ['//evil.com'], expected: '/dashboard' },
          { description: '역슬래시 우회', args: ['/\\evil.com'], expected: '/dashboard' },
          { description: 'javascript: 스킴', args: ['javascript:alert(1)'], expected: '/dashboard' },
          { description: '로그인 페이지로 되돌림 방지', args: ['/login?from=/dashboard'], expected: '/dashboard' }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`getSafeRedirect`는 `if (!from || !from.startsWith(\'/\')) return DEFAULT_REDIRECT;` → `const url = new URL(from, BASE_ORIGIN);` → `if (url.origin !== BASE_ORIGIN || url.pathname.startsWith(\'/login\')) return DEFAULT_REDIRECT;` → `return url.pathname + url.search + url.hash;` 순서입니다.'
    },
    {
      level: 2,
      content: '로그아웃 라우트는 `const response = NextResponse.json({ ok: true });`를 만든 뒤 `response.cookies.delete(ACCESS_TOKEN_COOKIE);`와 `response.cookies.set(REFRESH_TOKEN_COOKIE, \'\', { httpOnly: true, secure: true, sameSite: \'lax\', path: REFRESH_TOKEN_PATH, maxAge: 0 });`를 호출하고 반환합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다. (세 파일에 함께 적용됩니다)',
      codeSnippet: `// @file: lib/safe-redirect.ts
export const DEFAULT_REDIRECT = '/dashboard';

const BASE_ORIGIN = 'http://internal.invalid';

export function getSafeRedirect(from: string | null): string {
  if (!from || !from.startsWith('/')) return DEFAULT_REDIRECT;

  const url = new URL(from, BASE_ORIGIN);
  if (url.origin !== BASE_ORIGIN) return DEFAULT_REDIRECT;
  if (url.pathname.startsWith('/login')) return DEFAULT_REDIRECT;

  return url.pathname + url.search + url.hash;
}

// @file: hooks/useLoginSubmit.ts
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginForm } from '@/hooks/useLoginForm';
import { useAuthStore } from '@/stores/authStore';
import { getSafeRedirect } from '@/lib/safe-redirect';

export function useLoginSubmit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  return useLoginForm((user) => {
    setUser(user);
    router.replace(getSafeRedirect(searchParams.get('from')));
    router.refresh();
  });
}

// @file: app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_PATH } from '@/lib/auth-config';
import { revokeRefreshToken } from '@/lib/sessions';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) await revokeRefreshToken(refreshToken);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: REFRESH_TOKEN_PATH,
    maxAge: 0
  });
  return response;
}
`
    }
  ]
}
