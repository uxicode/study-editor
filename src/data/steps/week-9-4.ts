import type { CurriculumStep } from '@/types/curriculum'

export const week_9_4: CurriculumStep = {
  id: 'week-9-4',
  title: '9주차 · OAuth2 승인 코드 흐름 및 소셜 로그인 연동',
  order: 52,
  category: 'advanced',
  content: {
    mission:
      'Github 소셜 로그인 서비스 연동 시 필요한 OAuth2 Authorization Code 흐름의 첫 단계인 인가 엔드포인트 리다이렉트 주소를 생성하는 `getGithubAuthUrl(clientId: string, redirectUri: string): string` 함수를 작성하세요.\n- URL 파라미터로 \`client_id\`, \`redirect_uri\`, \`scope\`(값: \`"user:email"\`)를 올바르게 명시하세요.\n- 기본 호스트: \`https://github.com/login/oauth/authorize\`',
    theory: `
      ## 1. OAuth2 Authorization Code Flow (인가 코드 승인 흐름)
      가장 많이 쓰이는 소셜 로그인 보안 승인 모델입니다.
      1. 사용자가 서비스의 로그인 버튼을 누르면 소셜 플랫폼 인가 서버로 리다이렉트됩니다.
      2. 사용자 인증 동의 완료 후 서비스의 콜백 URI로 임시 **인가 코드(Authorization Code)**가 전달됩니다.
      3. 서비스 서버는 이 코드를 소셜 플랫폼 토큰 API로 보내어 최종 **액세스 토큰(Access Token)**을 발급받습니다.
    `,
    objectives: [
      'https://github.com/login/oauth/authorize 기본 호스트 URL을 활용할 것',
      '쿼리 스트링 파라미터로 client_id, redirect_uri, scope를 조합하여 유효한 URL로 반환할 것'
    ],
    exercise: "1. JWT 액세스 토큰 유효시간이 만료되기 직전에 자동으로 토큰을 연장(Silent Refresh)하는 `setupSilentRefresh` 함수를 구성하세요.\n2. `setTimeout` 타이머 또는 인터벌을 사용해 백그라운드 호출을 배치하세요."
  },
  initialFiles: [
    {
      name: 'oauth.ts',
      path: 'lib/oauth.ts',
      content: `export function getGithubAuthUrl(clientId: string, redirectUri: string): string {
  // Github OAuth 인가 요청 URL을 만들어 리턴하세요.
  const baseUrl = 'https://github.com/login/oauth/authorize';
  return baseUrl;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'lib/oauth.ts',
        pattern: 'client_id=',
        message: '쿼리 파라미터에 client_id 항목이 포함되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'lib/oauth.ts',
        pattern: 'redirect_uri=',
        message: '쿼리 파라미터에 redirect_uri 항목이 포함되어야 합니다.'
      },
      {
        type: 'includes',
        target: 'lib/oauth.ts',
        pattern: 'user:email',
        message: 'scope 값으로 "user:email" 권한 요청이 포함되어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`return `${baseUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;` 처럼 백틱 문자열 템플릿과 쿼리 스트링 조인 기호(`&`)를 사용해 문자열을 반환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function setupSilentRefresh(onRefresh: () => Promise<string>, delayMs: number) {
  const timer = setTimeout(async () => {
    try {
      const newToken = await onRefresh();
      console.log('Silent refresh successful, new token:', newToken);
      setupSilentRefresh(onRefresh, delayMs);
    } catch (err) {
      console.error('Silent refresh failed:', err);
    }
  }, delayMs);
  return () => clearTimeout(timer);
}`
    }
  ]
}