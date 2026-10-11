import type { CurriculumStep } from '@/types/curriculum'
import { AUTH_CONFIG_FILE } from './week-9-shared'

export const week_9_5: CurriculumStep = {
  id: 'week-9-5',
  title: '9주차 · 미들웨어로 페이지 보호: 쿠키 존재가 아니라 서명 검증',
  order: 53,
  category: 'advanced',
  content: {
    mission:
      '`/dashboard`, `/settings` 이하 경로를 보호하는 `middleware.ts`를 완성하세요.\n- 쿠키(`ACCESS_TOKEN_COOKIE`)가 **있는지만** 보지 말고 `jose`의 `jwtVerify(token, getJwtSecret(), { algorithms: [\'HS256\'] })`로 서명과 만료를 검증하세요.\n- 토큰이 없거나 검증에 실패하면 `redirectToLogin(request)`로 보내세요. 이 함수는 원래 경로를 `?from=`에 담고, 깨진 쿠키를 삭제합니다.\n- 검증에 성공하면 `NextResponse.next()`로 통과시킵니다.',
    theory: `
## 미들웨어의 위치

\`\`\`text
브라우저 ──GET /dashboard──▶ [middleware.ts] ──통과──▶ 페이지(Server Component) ──▶ 응답
                                  │
                                  └──차단──▶ 302 /login?from=/dashboard
\`\`\`

미들웨어는 **요청이 페이지에 도달하기 전에** 실행됩니다. 로그인하지 않은 사용자가 보호된 화면을 잠깐이라도 보게 되는 "깜빡임" 없이 리다이렉트할 수 있습니다.

> Next.js 16부터는 파일명이 \`proxy.ts\`, 함수명이 \`proxy\`로 바뀌었습니다. 동작과 개념은 같으니 이 실습의 내용을 그대로 적용하면 됩니다.

## 1. 쿠키가 "있다"는 것은 아무 의미가 없다

\`\`\`ts
// 잘못된 예: 존재 여부만 확인
if (!request.cookies.get('access_token')) return redirect;
\`\`\`

쿠키는 사용자가 마음대로 만들 수 있습니다. 개발자 도구에서 \`access_token=hello\`를 넣기만 해도 통과합니다. **서명 검증**만이 "우리 서버가 발급한, 만료되지 않은 토큰"임을 보장합니다.

\`\`\`ts
import { jwtVerify } from 'jose';

const { payload } = await jwtVerify(token, getJwtSecret(), {
  algorithms: ['HS256'] // 허용할 알고리즘을 고정
});
// 서명이 다르거나 exp 가 지났으면 예외 → catch 에서 차단
\`\`\`

| 함수 | 하는 일 | 보호 용도로 써도 되나? |
|------|---------|----------------------|
| decodeJwt / atob | Base64 디코딩만 (서명 확인 X) | 안 됨 — 위조 토큰도 통과 |
| jwtVerify | 서명 + exp + nbf 검증 | 사용 |

**algorithms를 고정하는 이유**: 토큰 헤더의 alg 값은 공격자가 바꿀 수 있습니다. 서버가 헤더를 믿고 알고리즘을 고르면 \`alg: none\`이나 알고리즘 혼동 공격에 노출됩니다. 서버가 허용 목록을 정해야 합니다.

## 2. 실패하면 원래 가려던 곳을 기억

\`\`\`ts
function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_TOKEN_COOKIE); // 만료·위조된 쿠키 정리
  return response;
}
\`\`\`

로그인 후 \`from\`으로 돌려보내면 사용자 경험이 좋아집니다. 단, \`from\` 값은 공격자도 조작할 수 있으므로 **돌려보낼 때 반드시 검사**해야 합니다. (종합 스텝에서 구현)

## 3. matcher로 실행 범위 제한

\`\`\`ts
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
\`\`\`

matcher가 없으면 이미지·CSS·\`/_next/static\` 요청에도 미들웨어가 돌아 느려집니다. 그리고 **\`/login\`을 보호 대상에 넣으면 무한 리다이렉트**가 발생하니 주의하세요.

## 4. 미들웨어만 믿으면 안 된다 (Defense in Depth)

2025년 3월, 특정 헤더(\`x-middleware-subrequest\`)를 붙이면 Next.js 미들웨어를 **통째로 건너뛸 수 있는 취약점(CVE-2025-29927)**이 공개되었습니다. 미들웨어로만 인증을 처리하던 서비스는 모두 노출되었습니다.

| 계층 | 역할 |
|------|------|
| 미들웨어 | 빠른 리다이렉트 (UX, 1차 관문) |
| Route Handler / Server Action / Server Component | 데이터를 읽고 쓰기 직전에 **다시 검증** (보안) |

\`\`\`ts
// lib/session.ts — 데이터 접근 직전에 항상 호출
export async function requireUser() {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect('/login');
  const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
  return { id: payload.sub as string };
}
\`\`\`

## 흔한 실수

- 토큰 존재 여부만 확인하거나 decode만 하고 통과시키는 것
- 클라이언트 컴포넌트의 \`useEffect\`에서 로그인 여부를 확인해 리다이렉트 — 화면이 먼저 렌더링되고, JS를 끄면 그대로 보입니다.
- \`try/catch\` 없이 \`jwtVerify\` 호출 — 만료된 토큰 하나로 500 에러 페이지가 뜹니다.
    `,
    objectives: [
      '쿠키 존재 여부만으로 인증을 판단하면 안 되는 이유를 설명할 수 있다',
      'jose의 jwtVerify로 서명과 만료를 검증하고 허용 알고리즘을 고정할 수 있다',
      '인증 실패 시 원래 경로를 from 파라미터에 담아 로그인 페이지로 리다이렉트할 수 있다',
      'matcher로 미들웨어 실행 범위를 제한하고 무한 리다이렉트를 피할 수 있다',
      '미들웨어 외에 데이터 접근 계층에서도 인증을 다시 확인해야 하는 이유를 설명할 수 있다'
    ],
    exercise: `
1. \`redirectToLogin(request)\`을 완성하세요.
   - \`new URL('/login', request.url)\`을 만들고 \`searchParams.set('from', 경로 + 쿼리)\`
   - \`NextResponse.redirect(loginUrl)\` 응답에서 \`response.cookies.delete(ACCESS_TOKEN_COOKIE)\` 후 반환
2. \`middleware(request)\`를 완성하세요.
   - \`request.cookies.get(ACCESS_TOKEN_COOKIE)?.value\`가 없으면 \`redirectToLogin\`
   - \`try { await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] }); return NextResponse.next(); }\`
   - \`catch\`에서 \`redirectToLogin\`
3. \`config.matcher\`는 \`/dashboard/:path*\`, \`/settings/:path*\` 두 개입니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'middleware.ts',
      path: 'middleware.ts',
      content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_TOKEN_COOKIE, getJwtSecret } from '@/lib/auth-config';

function redirectToLogin(request: NextRequest) {
  // TODO: /login?from=<원래 경로> 로 리다이렉트하고 깨진 쿠키를 삭제하세요.
  return NextResponse.redirect(new URL('/login', request.url));
}

export async function middleware(request: NextRequest) {
  // TODO: 쿠키에서 토큰을 읽고 jwtVerify 로 서명·만료를 검증하세요.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
`,
      language: 'typescript'
    },
    AUTH_CONFIG_FILE
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /request\.cookies\.get\(\s*ACCESS_TOKEN_COOKIE\s*\)/,
        message: 'request.cookies.get(ACCESS_TOKEN_COOKIE)로 토큰을 읽으세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /await\s+jwtVerify\(\s*\w+\s*,\s*getJwtSecret\(\)/,
        message: '쿠키 존재 여부만 보면 위조 토큰도 통과합니다. await jwtVerify(token, getJwtSecret(), ...)로 서명을 검증하세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /algorithms:\s*\[\s*['"]HS256['"]\s*\]/,
        message: "jwtVerify 옵션에 algorithms: ['HS256']을 지정해 허용 알고리즘을 고정하세요."
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /try\s*\{[\s\S]*jwtVerify[\s\S]*\}\s*catch/,
        message: 'jwtVerify는 만료·위조 시 예외를 던집니다. try { ... } catch { ... }로 감싸세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /catch\s*(\([^)]*\))?\s*\{[\s\S]*?redirectToLogin\(\s*request\s*\)/,
        message: 'catch 블록에서 redirectToLogin(request)를 반환하세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /if\s*\(\s*!\w+\s*\)\s*(\{\s*)?return\s+redirectToLogin\(\s*request\s*\)/,
        message: '토큰이 없으면 if (!token) return redirectToLogin(request);로 바로 차단하세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /searchParams\.set\(\s*['"]from['"]/,
        message: "로그인 후 돌아올 수 있도록 loginUrl.searchParams.set('from', ...)을 추가하세요."
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /cookies\.delete\(\s*ACCESS_TOKEN_COOKIE\s*\)/,
        message: '리다이렉트 응답에서 response.cookies.delete(ACCESS_TOKEN_COOKIE)로 깨진 쿠키를 지우세요.'
      },
      {
        type: 'includes',
        target: 'middleware.ts',
        pattern: 'NextResponse.next()',
        message: '검증에 성공하면 NextResponse.next()로 요청을 통과시키세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /^(?![\s\S]*(decodeJwt\(|jwt\.decode\(|atob\())[\s\S]*$/,
        message: 'decodeJwt/atob는 서명을 확인하지 않습니다. 보호 용도로는 jwtVerify만 사용하세요.'
      },
      {
        type: 'regex',
        target: 'middleware.ts',
        pattern: /^(?![\s\S]*matcher:[^\]]*['"]\/login)[\s\S]*$/,
        message: 'matcher에 /login을 넣으면 무한 리다이렉트가 발생합니다. 보호할 경로만 넣으세요.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value; if (!token) return redirectToLogin(request);`로 시작하세요.'
    },
    {
      level: 2,
      content: '`try { await jwtVerify(token, getJwtSecret(), { algorithms: [\'HS256\'] }); return NextResponse.next(); } catch { return redirectToLogin(request); }` 구조입니다. redirectToLogin 안에서는 `loginUrl.searchParams.set(\'from\', request.nextUrl.pathname + request.nextUrl.search)`를 사용하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ACCESS_TOKEN_COOKIE, getJwtSecret } from '@/lib/auth-config';

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  return response;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  try {
    await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*']
};
`
    }
  ]
}
