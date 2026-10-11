import type { CurriculumStep } from '@/types/curriculum'

export const week_9_7: CurriculumStep = {
  id: 'week-9-7',
  title: '9주차 · OAuth 2.0 소셜 로그인: Authorization Code + state + PKCE',
  order: 55,
  category: 'advanced',
  content: {
    mission:
      'GitHub 로그인의 첫 단계와 콜백 검증에 쓸 함수 두 개를 `lib/oauth.ts`에 작성하세요.\n- `buildGithubAuthorizeUrl(clientId, redirectUri, state, codeChallenge)`: `new URL(GITHUB_AUTHORIZE_URL)`에 `searchParams.set()`으로 `client_id` → `redirect_uri` → `scope`(`read:user user:email`) → `state` → `code_challenge` → `code_challenge_method`(`S256`) 순서로 추가한 뒤 `toString()` 반환\n- `isValidOAuthState(received, expected)`: 둘 다 비어 있지 않고 서로 같을 때만 `true`',
    theory: `
## OAuth 2.0은 "로그인"이 아니라 "권한 위임"

OAuth는 원래 "이 앱이 내 GitHub 이메일을 읽어도 된다"는 **권한을 위임**하는 규약입니다. 소셜 로그인은 그 권한으로 사용자 정보를 받아 와서 **우리 서비스의 세션을 새로 만드는 것**입니다.

| 역할 | 이 실습에서 |
|------|-----------|
| Resource Owner | 사용자 |
| Client | 우리 Next.js 서비스 |
| Authorization Server | github.com/login/oauth |
| Resource Server | api.github.com |

## 1. Authorization Code 흐름

\`\`\`text
① 브라우저 ──GET /api/auth/github──▶ 우리 서버
     서버: state, code_verifier 생성 → HttpOnly 쿠키에 저장
② 브라우저 ◀──302 github.com/login/oauth/authorize?client_id&redirect_uri&scope&state&code_challenge
③ 사용자가 GitHub에서 로그인·동의
④ 브라우저 ──GET /api/auth/callback/github?code=XYZ&state=abc──▶ 우리 서버
     서버: 쿠키의 state 와 쿼리의 state 비교 (다르면 거부)
⑤ 서버 ──POST github.com/login/oauth/access_token (code, client_secret, code_verifier)──▶ GitHub
⑥ 서버 ◀── GitHub access_token
⑦ 서버 ──GET api.github.com/user──▶ 사용자 정보 → 우리 DB 에서 사용자 찾기/생성
⑧ 브라우저 ◀── Set-Cookie: access_token=우리가 서명한 JWT (9-3과 동일)
\`\`\`

- **code**는 1회용·수 분짜리 교환권일 뿐이고, 진짜 토큰 교환(⑤)은 **서버끼리** 일어납니다.
- **client_secret**은 서버 환경 변수에만 둡니다. \`NEXT_PUBLIC_\` 접두사를 붙이면 브라우저 번들에 그대로 포함되니 절대 붙이지 마세요.
- GitHub의 access_token은 브라우저로 보내지 않습니다. 브라우저가 받는 것은 **우리 서비스의 세션 쿠키**뿐입니다.

## 2. state — 로그인 CSRF 방지

state가 없으면 공격자가 **자기 계정의 code**가 담긴 콜백 URL을 피해자에게 클릭시켜, 피해자를 공격자 계정으로 로그인시킬 수 있습니다. 피해자가 그 상태로 카드 정보를 입력하면 공격자 계정에 저장됩니다.

\`\`\`ts
const state = crypto.randomUUID();       // 요청마다 새 무작위 값
// HttpOnly 쿠키(oauth_state, Max-Age=600)에 저장해 두었다가
// 콜백의 ?state= 와 비교 → 다르거나 없으면 400
\`\`\`

## 3. PKCE — code 가로채기 방지

PKCE(Proof Key for Code Exchange)는 인가 요청을 보낸 쪽과 code를 교환하는 쪽이 **같은 주체**임을 증명합니다. 원래 모바일 앱용이었지만, 현재 OAuth 보안 권고(RFC 9700, OAuth 2.1)는 **모든 클라이언트에 PKCE 사용**을 권장합니다. Google, GitHub 등 주요 공급자가 지원합니다.

\`\`\`ts
// code_verifier: 43~128자의 무작위 문자열 (서버 쿠키에 보관)
const verifier = base64url(crypto.getRandomValues(new Uint8Array(32)));

// code_challenge = BASE64URL(SHA-256(verifier)) → 인가 URL에 포함
const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
const challenge = base64url(new Uint8Array(digest));

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
}
\`\`\`

공격자가 중간에 code를 훔쳐도 verifier가 없으니 ⑤단계 교환에 실패합니다.

## 4. URL은 문자열로 이어 붙이지 않는다

\`\`\`ts
// 위험: redirectUri 에 & 나 # 이 섞이면 파라미터가 깨지거나 주입됨
\`\${base}?client_id=\${clientId}&redirect_uri=\${redirectUri}\`

// 안전: URL / URLSearchParams 가 알아서 인코딩
const url = new URL(GITHUB_AUTHORIZE_URL);
url.searchParams.set('redirect_uri', redirectUri);
url.toString(); // ...redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F...
\`\`\`

\`searchParams\`는 공백을 \`+\`로, \`:\`를 \`%3A\`로 인코딩합니다.

## 5. scope는 최소한으로

| scope | 의미 |
|-------|------|
| read:user | 프로필 읽기 |
| user:email | 이메일 주소 읽기 (비공개 이메일 포함) |
| repo | **모든 저장소 읽기·쓰기** — 로그인에는 필요 없음 |

## 6. 계정 연결 주의

GitHub 이메일이 기존 회원의 이메일과 같다고 **자동으로 계정을 합치면 안 됩니다.** 공급자가 이메일 소유를 확인했는지(GitHub의 verified 플래그 등)를 검사하고, 가능하면 기존 비밀번호로 한 번 더 확인한 뒤 연결하세요. 그렇지 않으면 남의 이메일로 소셜 계정을 만든 공격자가 기존 계정을 차지합니다.

## 흔한 실수

- state 없이 구현하거나, 고정 문자열을 state로 사용
- 콜백에서 state를 비교하지 않음
- client_secret을 프론트엔드 코드나 \`NEXT_PUBLIC_\` 환경 변수에 둠
- Implicit Flow(\`response_type=token\`) 사용 — 토큰이 URL에 노출되어 현재는 **폐기된 방식**입니다.
    `,
    objectives: [
      'OAuth 2.0 Authorization Code 흐름의 각 단계가 어디서(브라우저/서버) 실행되는지 설명할 수 있다',
      'state가 막는 로그인 CSRF 공격을 설명하고 콜백에서 state를 검증할 수 있다',
      'PKCE의 code_verifier와 code_challenge의 관계를 설명할 수 있다',
      'URL과 searchParams로 인가 URL을 안전하게 조립할 수 있다',
      'client_secret과 공급자 토큰을 브라우저에 노출하지 않아야 하는 이유를 설명할 수 있다'
    ],
    exercise: `
1. \`buildGithubAuthorizeUrl(clientId, redirectUri, state, codeChallenge)\`
   - \`const url = new URL(GITHUB_AUTHORIZE_URL);\`
   - \`url.searchParams.set(...)\`을 아래 순서로 호출: \`client_id\`, \`redirect_uri\`, \`scope\` (값: \`GITHUB_SCOPE\`), \`state\`, \`code_challenge\`, \`code_challenge_method\` (값: \`'S256'\`)
   - \`return url.toString();\`
2. \`isValidOAuthState(received, expected)\`
   - \`received\`나 \`expected\`가 비어 있으면(\`null\`, \`''\`) \`false\`
   - 둘이 같을 때만 \`true\`
3. 문자열 템플릿으로 쿼리스트링을 직접 이어 붙이지 마세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'oauth.ts',
      path: 'lib/oauth.ts',
      content: `export const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_SCOPE = 'read:user user:email';

/**
 * ① 단계: 사용자를 GitHub 동의 화면으로 보낼 URL 을 만든다.
 * state, codeChallenge 는 서버가 요청마다 새로 생성해 HttpOnly 쿠키에 보관한 값이다.
 */
export function buildGithubAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  // TODO: new URL + searchParams.set 으로 조립하세요.
  return GITHUB_AUTHORIZE_URL;
}

/**
 * ④ 단계: 콜백 쿼리의 state 와 쿠키에 저장해 둔 state 를 비교한다.
 */
export function isValidOAuthState(received: string | null, expected: string | null): boolean {
  // TODO
  return true;
}
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'lib/oauth.ts',
        pattern: /new\s+URL\(\s*GITHUB_AUTHORIZE_URL\s*\)/,
        message: 'new URL(GITHUB_AUTHORIZE_URL)로 URL 객체를 만드세요.'
      },
      {
        type: 'regex',
        target: 'lib/oauth.ts',
        pattern: /searchParams\.set\(\s*['"]state['"]/,
        message: "로그인 CSRF를 막기 위해 searchParams.set('state', state)를 추가하세요."
      },
      {
        type: 'regex',
        target: 'lib/oauth.ts',
        pattern: /searchParams\.set\(\s*['"]code_challenge_method['"]\s*,\s*['"]S256['"]/,
        message: "PKCE를 위해 searchParams.set('code_challenge_method', 'S256')을 추가하세요."
      },
      {
        type: 'regex',
        target: 'lib/oauth.ts',
        pattern: /^(?![\s\S]*\?client_id=\$\{)(?![\s\S]*client_secret)[\s\S]*$/,
        message: '쿼리스트링을 문자열로 이어 붙이지 말고, client_secret은 프론트엔드 코드에 두지 마세요.'
      }
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'lib/oauth.ts',
        functionName: 'buildGithubAuthorizeUrl',
        cases: [
          {
            description: '인가 URL 조립 (state + PKCE 포함)',
            args: [
              'Iv1.8a61f9b3a7aba766',
              'http://localhost:3000/api/auth/callback/github',
              's7Xk2pQ9',
              'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
            ],
            expected:
              'https://github.com/login/oauth/authorize?client_id=Iv1.8a61f9b3a7aba766&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fauth%2Fcallback%2Fgithub&scope=read%3Auser+user%3Aemail&state=s7Xk2pQ9&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256'
          },
          {
            description: 'redirect_uri 에 섞인 & 가 파라미터로 주입되지 않음',
            args: ['cid', 'https://app.example.com/cb?next=/a&admin=1', 'st', 'ch'],
            expected:
              'https://github.com/login/oauth/authorize?client_id=cid&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcb%3Fnext%3D%2Fa%26admin%3D1&scope=read%3Auser+user%3Aemail&state=st&code_challenge=ch&code_challenge_method=S256'
          }
        ]
      },
      {
        target: 'lib/oauth.ts',
        functionName: 'isValidOAuthState',
        cases: [
          { description: '같은 state', args: ['s7Xk2pQ9', 's7Xk2pQ9'], expected: true },
          { description: '다른 state', args: ['s7Xk2pQ9', 'attacker'], expected: false },
          { description: '콜백에 state 없음', args: [null, 's7Xk2pQ9'], expected: false },
          { description: '쿠키에 state 없음', args: ['s7Xk2pQ9', null], expected: false },
          { description: '둘 다 빈 문자열', args: ['', ''], expected: false }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '`const url = new URL(GITHUB_AUTHORIZE_URL); url.searchParams.set(\'client_id\', clientId);` 처럼 순서대로 6번 호출한 뒤 `return url.toString();` 하세요.'
    },
    {
      level: 2,
      content: '`isValidOAuthState`는 `if (!received || !expected) return false; return received === expected;` 두 줄이면 됩니다. state는 1회용 무작위 값이라 비밀번호처럼 상수 시간 비교까지는 필요 없습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export const GITHUB_AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
export const GITHUB_SCOPE = 'read:user user:email';

export function buildGithubAuthorizeUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const url = new URL(GITHUB_AUTHORIZE_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', GITHUB_SCOPE);
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export function isValidOAuthState(received: string | null, expected: string | null): boolean {
  if (!received || !expected) return false;
  return received === expected;
}
`
    }
  ]
}
