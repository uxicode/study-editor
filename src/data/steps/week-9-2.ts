import type { CurriculumStep } from '@/types/curriculum'

export const week_9_2: CurriculumStep = {
  id: 'week-9-2',
  title: '9주차 · Next.js Middleware를 활용한 라우트 보호',
  order: 50,
  category: 'advanced',
  content: {
    mission:
      '대시보드 경로(\`/dashboard\`)에 접근 시 쿠키 저장소에 인증 토큰(\`auth-token\`)이 존재하는지 검증하는 Next.js 미들웨어(\`middleware.ts\`) 파일을 완성하세요.\n- 쿠키에 \`auth-token\`이 존재하지 않을 경우, 로그인 페이지(\`/login\`)로 리다이렉트 처리해야 합니다.\n- 토큰이 존재한다면 \`NextResponse.next()\`를 반환해 요청을 계속 통과시키세요.',
    theory: `
      ## 1. Next.js Middleware
      Next.js Middleware를 활용하면 페이지 요청이나 API 호출이 완료되기 전에 요청을 가로채서(intercept) 쿠키 파싱, 라우팅 리다이렉트, 로깅 등을 전역적으로 처리할 수 있습니다.
      - **경로 설정**: 파일명은 반드시 프로젝트 루트 또는 \`src/\` 폴더의 바로 아래에 \`middleware.ts\`로 두어야 합니다.
      - **매칭 필터**: \`config.matcher\` 설정을 통해 특정 주소군에만 미들웨어가 실행되도록 제한할 수 있습니다.
    `,
    objectives: [
      'NextRequest와 NextResponse를 활용하여 미들웨어 함수를 선언할 것',
      'request.cookies.get("auth-token")을 통해 쿠키 데이터를 탐색할 것',
      '토큰 부재 시 NextResponse.redirect(new URL("/login", request.url)) 형태로 리다이렉션 처리할 것'
    ],
    exercise: "1. Next.js 미들웨어(`middleware.ts`) 파일을 작성하고 비인증 접근 시 로그인 페이지로 강제 리다이렉트하는 필터 핸들러를 구성하세요.\n2. `cookie`에 담긴 JWT 토큰 존재 여부를 확인하고, 요청 경로 매칭 설정을 적용하세요."
  },
  initialFiles: [
    {
      name: 'middleware.ts',
      path: 'middleware.ts',
      content: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/dashboard')) {
    // 여기에 쿠키 'auth-token' 유무를 검사하여 없으면 /login 으로 리다이렉트 시키는 코드를 작성하세요.
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'middleware.ts',
        pattern: '.cookies.get(',
        message: 'request.cookies.get() 메서드를 사용해 토큰이 쿠키에 존재하는지 읽어야 합니다.'
      },
      {
        type: 'includes',
        target: 'middleware.ts',
        pattern: 'NextResponse.redirect(',
        message: '토큰이 없으면 NextResponse.redirect()를 통해 로그인 페이지로 튕겨내야 합니다.'
      },
      {
        type: 'includes',
        target: 'middleware.ts',
        pattern: '"/login"',
        message: '리다이렉션할 목적지 경로는 "/login" 이어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`const token = request.cookies.get("auth-token");` 로 쿠키 존재 여부를 점검하세요.'
    },
    {
      level: 2,
      content: '조건식은 `if (!token) { return NextResponse.redirect(new URL("/login", request.url)); }`와 유사하게 작성하여 사용자를 튕겨냅니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};`
    }
  ]
}