import type { CurriculumStep } from '@/types/curriculum'

export const week_9_1: CurriculumStep = {
  id: 'week-9-1',
  title: '9주차 · 쿠키 기반 세션 인증 vs. JWT 인증 패러다임',
  order: 49,
  category: 'advanced',
  content: {
    mission:
      'Express나 Fastify 환경에서 JWT를 생성하고 헤더 혹은 쿠키로 전달하기 위해 토큰을 서명하는 `generateAccessToken(user: { id: string; email: string }): string` 함수를 작성하세요. `jsonwebtoken` 패키지의 `.sign()` 메서드를 반드시 활용하세요.',
    theory: `
      ## 1. 쿠키 기반 세션 인증 (Session Auth)
      - **방식**: 서버 메모리나 DB(Redis 등)에 세션 객체를 저장하고, 브라우저에는 세션 ID만 HttpOnly 쿠키로 보관합니다.
      - **장점**: 토큰 만료 및 강제 로그아웃 제어가 쉽습니다.
      - **단점**: 서버 부하가 있고 확장에 다소 불리합니다.

      ## 2. JWT (JSON Web Token) 인증
      - **방식**: 유저 상태 정보를 자체 포함(Self-contained)하여 암호 서명한 뒤 토큰 자체를 클라이언트(LocalStorage 혹은 Cookie)에 둡니다.
      - **장점**: Stateless하게 서버 부담 없이 확장성이 좋습니다.
      - **단점**: 탈취 시 유효기간 만료 전까지 임의 무효화가 어렵습니다.

      \`\`\`ts
      import jwt from 'jsonwebtoken';

      const token = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '15m' }
      );
      \`\`\`
    `,
    objectives: [
      'jsonwebtoken 모듈의 sign() 메서드를 사용할 것',
      '유저 정보와 비밀 키(secret), 만료 시간(expiresIn) 옵션을 적용하여 토큰을 서명할 것'
    ],
    exercise: "1. 이메일과 비밀번호를 받아 유효성을 인증하고 JWT 토큰을 서명하여 반환하는 `loginHandler` 함수를 작성하세요.\n2. 비밀키를 기반으로 토큰을 발급하여 쿠키에 세팅하거나 JSON 객체에 얹어 클라이언트로 내려주세요."
  },
  initialFiles: [
    {
      name: 'auth.ts',
      path: 'lib/auth.ts',
      content: `import jwt from 'jsonwebtoken';

const JWT_SECRET = 'super-secret-key-change-me';

export function generateAccessToken(user: { id: string; email: string }): string {
  // jsonwebtoken의 sign 메서드를 사용하여 토큰을 발급하세요.
  return '';
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'lib/auth.ts',
        pattern: 'jwt.sign(',
        message: 'jwt.sign() 메서드를 사용하여 JWT 토큰을 서명 생성해야 합니다.'
      },
      {
        type: 'includes',
        target: 'lib/auth.ts',
        pattern: 'expiresIn:',
        message: '보안을 위해 토큰의 만료 시간(expiresIn) 옵션을 반드시 설정해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "15m" })`와 같이 작성해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import jwt from 'jsonwebtoken';

export function loginHandler(req: any, res: any) {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'password123') {
    const token = jwt.sign({ email, role: 'ADMIN' }, 'super-secret-key', { expiresIn: '1h' });
    return res.status(200).json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
}`
    }
  ]
}