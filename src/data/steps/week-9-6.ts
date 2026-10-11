import type { CurriculumStep } from '@/types/curriculum'

export const week_9_6: CurriculumStep = {
  id: 'week-9-6',
  title: '9주차 · 토큰 만료와 Refresh: 401 한 번에 갱신 한 번',
  order: 54,
  category: 'advanced',
  content: {
    mission:
      '모든 API 호출이 거쳐 가는 `apiFetch`를 완성해 액세스 토큰이 만료되어도 사용자가 눈치채지 못하게 하세요.\n- 401을 받으면 `refreshSession()`으로 **한 번만** 갱신하고 원래 요청을 **한 번만** 재시도\n- 동시에 여러 요청이 401을 받아도 갱신 요청은 **1개**만 나가도록 `refreshPromise`를 공유 (single-flight)\n- 갱신 요청 자체(`REFRESH_URL`)가 401이면 재시도하지 않고, 갱신에 실패하면 `onSessionExpired()`로 로그인 페이지 이동\n- 토큰을 JavaScript로 다루지 마세요. 쿠키는 `credentials: \'include\'`로 자동 전송됩니다.',
    theory: `
## 왜 토큰이 두 개인가

액세스 토큰은 탈취되면 만료 전까지 막기 어렵기 때문에 수명을 짧게(15분) 둡니다. 그러면 15분마다 다시 로그인해야 하니, 수명이 긴 **리프레시 토큰**으로 새 액세스 토큰을 받아 옵니다.

| 구분 | Access Token | Refresh Token |
|---|---|---|
| 용도 | 모든 API 요청의 인증 | 새 Access Token 발급 전용 |
| 수명 | 짧게 (5~15분) | 길게 (7~30일) |
| 쿠키 Path | / | /api/auth/refresh (그 외 요청엔 안 실림) |
| 서버 저장 | 안 함 (서명 검증) | **DB에 해시로 저장** → 강제 폐기 가능 |
| 형식 | JWT | 불투명한 무작위 문자열이면 충분 |

리프레시 토큰의 쿠키 Path를 갱신 엔드포인트로 좁히면, 일반 API 요청에는 아예 실리지 않아 노출 기회가 줄어듭니다.

## 1. 전체 흐름

\`\`\`text
GET /api/orders            ──▶ 401 (access 만료)
POST /api/auth/refresh     ──▶ 200 + Set-Cookie: access_token=새것, refresh_token=새것
GET /api/orders (재시도)    ──▶ 200
\`\`\`

## 2. Refresh Token Rotation (서버 쪽)

갱신할 때마다 **리프레시 토큰도 새로 발급하고 이전 것은 폐기**합니다. 이미 폐기된 리프레시 토큰이 다시 들어오면 탈취로 간주하고 그 사용자의 모든 세션을 끊습니다(재사용 탐지).

\`\`\`ts
// app/api/auth/refresh/route.ts (개념 코드)
export async function POST(request: NextRequest) {
  const presented = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const session = presented ? await findSessionByTokenHash(sha256(presented)) : null;

  if (!session) return NextResponse.json({ message: '세션이 만료되었습니다.' }, { status: 401 });
  if (session.revokedAt) {                       // 이미 쓴 토큰이 또 왔다 = 탈취
    await revokeAllSessions(session.userId);
    return NextResponse.json({ message: '세션이 만료되었습니다.' }, { status: 401 });
  }

  const next = await rotateSession(session);     // 이전 것 폐기 + 새 토큰 발급
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, next.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: ACCESS_TOKEN_TTL_SEC });
  response.cookies.set(REFRESH_TOKEN_COOKIE, next.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', path: REFRESH_TOKEN_PATH, maxAge: REFRESH_TOKEN_TTL_SEC });
  return response;
}
\`\`\`

## 3. 문제: 동시에 401이 여러 개 오면?

대시보드가 열리면서 API 5개가 동시에 나갔고, 모두 401을 받았다고 해 봅시다.

\`\`\`text
[단순 구현]                          [single-flight]
요청 A 401 → refresh #1 ✓            요청 A 401 ┐
요청 B 401 → refresh #2 ✗ (재사용!)   요청 B 401 ├─▶ refresh 1번 ✓ ─▶ A~E 재시도
요청 C 401 → refresh #3 ✗            요청 C 401 ┘
→ 재사용 탐지로 전체 로그아웃          → 정상
\`\`\`

Rotation을 쓰면 첫 갱신에서 이전 리프레시 토큰이 폐기되므로, 나머지 4개의 갱신 요청은 **"폐기된 토큰 재사용"**으로 판단되어 사용자가 강제 로그아웃됩니다. 그래서 진행 중인 갱신 Promise를 모듈 변수에 두고 **모두가 같은 Promise를 기다리게** 합니다.

\`\`\`ts
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(REFRESH_URL, { method: 'POST', credentials: 'include' })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null; // 끝나면 비워야 다음 만료 때 다시 갱신 가능
      });
  }
  return refreshPromise;
}
\`\`\`

## 4. 무한 루프 막기

| 상황 | 막는 방법 |
|------|----------|
| 갱신 후 재시도했는데 또 401 | hasRetried 플래그로 **한 번만** 재시도 |
| 갱신 요청 자체가 401 | REFRESH_URL은 재시도 대상에서 제외 |
| 갱신 실패 | 더 시도하지 말고 로그인 페이지로 |

> Axios를 쓴다면 같은 원리로 \`interceptors.response.use\`의 에러 핸들러에서 \`config._retry\` 플래그와 공유 Promise를 사용합니다.

## 5. 갱신 실패 시

\`\`\`ts
function onSessionExpired() {
  const from = window.location.pathname + window.location.search;
  window.location.assign(\`/login?from=\${encodeURIComponent(from)}\`);
}
\`\`\`

\`router.push\` 대신 \`location.assign\`을 쓰면 메모리에 남은 사용자 상태(스토어, 캐시)가 전부 초기화됩니다.

## 흔한 실수

- 리프레시 토큰을 localStorage에 저장 — 탈취되면 30일짜리 마스터키가 됩니다.
- 401마다 무조건 갱신 → 갱신 요청이 401을 받으면 다시 갱신 → 무한 루프
- \`finally\`에서 refreshPromise를 비우지 않아, 한 번 실패한 Promise가 영원히 재사용되는 경우
    `,
    objectives: [
      'Access Token과 Refresh Token의 수명, 저장 위치, 쿠키 Path를 구분해 설명할 수 있다',
      'Refresh Token Rotation과 재사용 탐지의 원리를 설명할 수 있다',
      '공유 Promise로 동시 401 상황에서 갱신 요청을 하나로 합칠 수 있다(single-flight)',
      '재시도 플래그와 갱신 URL 제외로 무한 루프를 막을 수 있다',
      '갱신 실패 시 원래 경로를 담아 로그인 페이지로 이동시킬 수 있다'
    ],
    exercise: `
1. \`refreshSession()\`: \`refreshPromise\`가 없을 때만 \`fetch(REFRESH_URL, { method: 'POST', credentials: 'include' })\`로 새 Promise를 만들고, \`.finally()\`에서 \`refreshPromise = null\`로 비우세요. 결과는 \`res.ok\` (boolean)입니다.
2. \`apiFetch(input, init, hasRetried)\`:
   - \`fetch(input, { ...init, credentials: 'include' })\`
   - \`response.status !== 401\`이거나 \`hasRetried\`이거나 \`input === REFRESH_URL\`이면 그대로 반환
   - \`await refreshSession()\`이 false면 \`onSessionExpired()\` 후 원래 응답 반환
   - true면 \`apiFetch(input, init, true)\`로 **한 번만** 재시도
3. \`onSessionExpired()\`: 현재 경로를 \`encodeURIComponent\`로 인코딩해 \`/login?from=...\`으로 이동
    `.trim()
  },
  initialFiles: [
    {
      name: 'api-client.ts',
      path: 'lib/api-client.ts',
      content: `const REFRESH_URL = '/api/auth/refresh';

// 진행 중인 갱신 요청을 모든 호출이 공유한다.
let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  // TODO: refreshPromise 가 없을 때만 새로 만들고, 끝나면(finally) null 로 비우세요.
  return Promise.resolve(false);
}

function onSessionExpired(): void {
  // TODO: /login?from=<현재 경로> 로 이동
}

export async function apiFetch(input: string, init: RequestInit = {}, hasRetried = false): Promise<Response> {
  const response = await fetch(input, { ...init, credentials: 'include' });

  // TODO: 401 이면 한 번만 갱신 후 재시도. 갱신 URL 자체와 재시도 요청은 제외.
  return response;
}
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /if\s*\(\s*!refreshPromise\s*\)/,
        message: 'if (!refreshPromise) { ... }로 진행 중인 갱신이 없을 때만 새 요청을 만드세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /refreshPromise\s*=\s*fetch\(\s*REFRESH_URL/,
        message: 'refreshPromise = fetch(REFRESH_URL, ...)로 갱신 Promise를 공유 변수에 담으세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /method:\s*['"]POST['"]/,
        message: "갱신 요청은 method: 'POST'로 보내세요. GET은 링크·이미지 태그로도 호출될 수 있습니다."
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /\.finally\(\s*\(\)\s*=>\s*\{?\s*refreshPromise\s*=\s*null/,
        message: '.finally(() => { refreshPromise = null; })로 갱신이 끝나면 공유 Promise를 비우세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /return\s+refreshPromise/,
        message: 'refreshSession은 공유 중인 refreshPromise를 반환해야 동시 요청이 같은 결과를 기다립니다.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /status\s*[!=]==\s*401/,
        message: 'response.status가 401인지 검사하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /input\s*===\s*REFRESH_URL|REFRESH_URL\s*===\s*input/,
        message: '갱신 요청 자체가 401이면 다시 갱신하지 않도록 input === REFRESH_URL을 제외하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /apiFetch\(\s*input\s*,\s*init\s*,\s*true\s*\)/,
        message: '갱신 성공 후 apiFetch(input, init, true)로 한 번만 재시도하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /if\s*\([^)]*hasRetried/,
        message: '이미 재시도한 요청(hasRetried)은 다시 갱신하지 않도록 조건에 포함하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /await\s+refreshSession\(\)/,
        message: 'await refreshSession()으로 갱신 결과를 기다리세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /if\s*\(\s*!\w+\s*\)\s*\{?\s*onSessionExpired\(\)/,
        message: '갱신에 실패하면 onSessionExpired()를 호출하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /\/login\?from=\$\{\s*encodeURIComponent\(/,
        message: 'onSessionExpired에서 `/login?from=${encodeURIComponent(from)}`으로 이동하세요.'
      },
      {
        type: 'regex',
        target: 'lib/api-client.ts',
        pattern: /^(?![\s\S]*(localStorage|sessionStorage|Authorization))[\s\S]*$/,
        message: '토큰을 JavaScript로 저장하거나 Authorization 헤더에 직접 넣지 마세요. HttpOnly 쿠키가 자동으로 전송됩니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`refreshSession`은 `if (!refreshPromise) { refreshPromise = fetch(...).then((res) => res.ok).catch(() => false).finally(() => { refreshPromise = null; }); } return refreshPromise;` 구조입니다.'
    },
    {
      level: 2,
      content: '`apiFetch`의 첫 조건은 `if (response.status !== 401 || hasRetried || input === REFRESH_URL) return response;` 입니다. 그 다음 `const refreshed = await refreshSession();`으로 분기하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `const REFRESH_URL = '/api/auth/refresh';

let refreshPromise: Promise<boolean> | null = null;

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(REFRESH_URL, { method: 'POST', credentials: 'include' })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function onSessionExpired(): void {
  const from = window.location.pathname + window.location.search;
  window.location.assign(\`/login?from=\${encodeURIComponent(from)}\`);
}

export async function apiFetch(input: string, init: RequestInit = {}, hasRetried = false): Promise<Response> {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (response.status !== 401 || hasRetried || input === REFRESH_URL) {
    return response;
  }

  const refreshed = await refreshSession();
  if (!refreshed) {
    onSessionExpired();
    return response;
  }

  return apiFetch(input, init, true);
}
`
    }
  ]
}
