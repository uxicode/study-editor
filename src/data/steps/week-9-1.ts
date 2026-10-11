import type { CurriculumStep } from '@/types/curriculum'

export const week_9_1: CurriculumStep = {
  id: 'week-9-1',
  title: '9주차 · 인증 기초: 세션 vs 토큰, 그리고 안전한 쿠키',
  order: 49,
  category: 'advanced',
  content: {
    mission:
      '로그인 토큰을 브라우저에 안전하게 내려주기 위한 `Set-Cookie` 헤더 값을 만드는 함수 두 개를 `lib/cookie.ts`에 작성하세요.\n- `serializeAuthCookie(name, value, maxAgeSec)` → `name=값; Path=/; Max-Age=초; HttpOnly; Secure; SameSite=Lax`\n- `clearAuthCookie(name)` → `name=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`\n- 값은 반드시 `encodeURIComponent()`로 인코딩하고, 속성은 위 순서 그대로 `; `로 이어 붙이세요.',
    theory: `
## 이번 주에 만드는 것

9주차는 **이메일·비밀번호 로그인 → 보호된 페이지 → 토큰 갱신 → 소셜 로그인 → 로그아웃**까지 한 줄로 이어지는 인증 흐름을 만듭니다. 순서는 "데이터가 실제로 흐르는 순서"를 따릅니다.

| 스텝 | 주제 | 어디서 실행되나 |
|------|------|----------------|
| 1 | 세션 vs 토큰, 쿠키 보안 속성 | 서버 → 브라우저 |
| 2 | 비밀번호 해싱 (bcrypt) | 서버 |
| 3 | 로그인 API (검증 → 비교 → 토큰 발급) | 서버 (Route Handler) |
| 4 | 로그인 폼 (react-hook-form + zod) | 브라우저 |
| 5 | 미들웨어로 페이지 보호 | Edge (요청 직전) |
| 6 | 토큰 만료와 Refresh | 브라우저 ↔ 서버 |
| 7 | OAuth 2.0 소셜 로그인 | 브라우저 ↔ 공급자 ↔ 서버 |
| 종합 | 로그인 → 이동 → 로그아웃 | 전체 |

## 1. 인증(Authentication)과 인가(Authorization)

- **인증**: "당신은 누구인가?" — 이메일·비밀번호, 소셜 로그인으로 신원을 확인합니다. 실패하면 **401 Unauthorized**.
- **인가**: "당신은 이걸 해도 되는가?" — 확인된 사용자의 권한(role)을 검사합니다. 실패하면 **403 Forbidden**.

이름이 헷갈리지만 HTTP 401은 사실상 "인증 안 됨", 403은 "권한 없음"입니다.

## 2. 세션 방식 vs 토큰(JWT) 방식

HTTP는 상태가 없기 때문에(stateless) 매 요청마다 "이 요청은 로그인한 그 사람의 것"이라는 증거를 함께 보내야 합니다. 그 증거를 어디에 보관하느냐가 두 방식의 차이입니다.

\`\`\`text
[세션 방식]
브라우저 ── 로그인 ──▶ 서버: 세션 저장소(Redis/DB)에 { sid: abc → userId: 7 } 저장
브라우저 ◀── Set-Cookie: sid=abc ── 서버
브라우저 ── Cookie: sid=abc ──▶ 서버: 저장소에서 abc 조회 → userId 7

[토큰(JWT) 방식]
브라우저 ── 로그인 ──▶ 서버: { sub: 7, exp: ... } 를 비밀키로 "서명"
브라우저 ◀── Set-Cookie: access_token=eyJ... ── 서버
브라우저 ── Cookie: access_token=eyJ... ──▶ 서버: 서명만 검증 (저장소 조회 없음)
\`\`\`

| 항목 | 세션 | JWT |
|------|------|-----|
| 서버 저장소 | 필요 (Redis 등) | 불필요 (서명 검증만) |
| 강제 로그아웃 | 세션 삭제로 즉시 가능 | 만료 전까지 어려움 → 짧은 만료 + Refresh |
| 수평 확장 | 공유 저장소 필요 | 쉬움 |
| 페이로드 | 서버에만 존재 | 누구나 디코딩 가능 (암호화 아님) |

> JWT는 **서명**(위조 방지)일 뿐 **암호화**가 아닙니다. 페이로드는 Base64URL이라 누구나 읽을 수 있으니 비밀번호·주민번호 같은 민감 정보는 절대 넣지 마세요.

## 3. 토큰을 어디에 보관할까?

프론트엔드에서 가장 많이 실수하는 부분입니다.

| 보관 위치 | XSS로 탈취 | CSRF 위험 | 새로고침 후 유지 | 평가 |
|-----------|-----------|-----------|-----------------|------|
| localStorage | 가능 (JS로 읽힘) | 없음 | 유지 | 권장하지 않음 |
| JS 메모리 변수 | 어려움 | 없음 | 사라짐 | Refresh와 함께 쓸 때만 |
| HttpOnly 쿠키 | 불가 (JS 접근 차단) | 있음 → SameSite로 완화 | 유지 | 권장 |

XSS(악성 스크립트 삽입)가 한 번이라도 발생하면 \`localStorage.getItem('token')\` 한 줄로 토큰이 외부로 유출됩니다. **HttpOnly 쿠키는 JavaScript에서 아예 읽을 수 없기 때문에** 이 경로를 원천 차단합니다.

## 4. 쿠키 보안 속성

\`\`\`text
Set-Cookie: access_token=eyJhbGci...; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax
\`\`\`

| 속성 | 의미 | 빠뜨리면 |
|------|------|---------|
| HttpOnly | document.cookie 로 읽기 불가 | XSS로 토큰 탈취 |
| Secure | HTTPS에서만 전송 (localhost는 예외 허용) | 공용 와이파이에서 평문 노출 |
| SameSite=Lax | 다른 사이트에서 시작된 POST·fetch에는 쿠키 미첨부 | CSRF 공격에 노출 |
| Path=/ | 쿠키를 보낼 경로 범위 | 일부 경로에서 로그인 풀림 |
| Max-Age | 초 단위 수명. 0이면 즉시 삭제 | 브라우저 종료 시 삭제(세션 쿠키) |

- **SameSite=Strict**는 더 안전하지만, 외부 링크(메일, 검색 결과)로 들어올 때도 쿠키가 빠져 "로그인이 풀린 것처럼" 보입니다. 일반 서비스는 **Lax**가 기본값입니다.
- **SameSite=None**은 반드시 Secure와 함께 써야 하며, 서드파티 임베드 같은 특수한 경우에만 사용합니다.
- **Domain은 생략**하세요. 지정하면 하위 도메인 전체로 쿠키가 퍼집니다.

## 5. 값은 왜 인코딩해야 할까?

쿠키 문법에서 \`;\`, \`,\`, 공백은 구분자입니다. 값에 \`;\`가 섞이면 \`token=a; HttpOnly\`처럼 **값이 속성으로 해석되는 헤더 인젝션**이 생깁니다.

\`\`\`ts
encodeURIComponent('a b;c'); // 'a%20b%3Bc'
\`\`\`

## 흔한 실수

- 로그인 응답 JSON으로 토큰을 내려주고 프론트에서 \`localStorage.setItem('token', ...)\` — XSS 한 번이면 끝납니다.
- 개발 중 편하려고 HttpOnly를 빼고 배포까지 그대로 가는 경우.
- 로그아웃 시 쿠키를 지우지 않고 화면 상태만 초기화 — 쿠키는 여전히 유효합니다. 같은 이름·같은 Path로 Max-Age=0을 보내야 지워집니다.
    `,
    objectives: [
      '인증(401)과 인가(403)의 차이를 설명할 수 있다',
      '세션 방식과 JWT 방식의 장단점을 비교할 수 있다',
      'localStorage 대신 HttpOnly 쿠키에 토큰을 두는 이유를 XSS 관점에서 설명할 수 있다',
      'HttpOnly, Secure, SameSite, Path, Max-Age 속성을 조합해 Set-Cookie 값을 만들 수 있다'
    ],
    exercise: `
1. \`serializeAuthCookie(name, value, maxAgeSec)\`를 구현하세요.
   - 첫 조각은 \`\${name}=\${encodeURIComponent(value)}\`
   - 이어서 \`Path=/\`, \`Max-Age=\${maxAgeSec}\`, \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\`
   - 모든 조각을 \`'; '\`로 연결해 반환
2. \`clearAuthCookie(name)\`을 구현하세요. 값은 빈 문자열, \`Max-Age=0\`이며 나머지 속성은 동일합니다.
3. 예) \`serializeAuthCookie('access_token', 'abc', 900)\` → \`access_token=abc; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax\`
    `.trim()
  },
  initialFiles: [
    {
      name: 'cookie.ts',
      path: 'lib/cookie.ts',
      content: `/**
 * 인증 토큰용 Set-Cookie 헤더 값을 만듭니다.
 * 속성 순서: Path=/ → Max-Age → HttpOnly → Secure → SameSite=Lax
 */
export function serializeAuthCookie(name: string, value: string, maxAgeSec: number): string {
  // TODO: 값을 encodeURIComponent 로 인코딩하고 보안 속성을 붙여 반환하세요.
  return '';
}

/**
 * 같은 이름·같은 Path 로 Max-Age=0 을 보내 쿠키를 삭제합니다.
 */
export function clearAuthCookie(name: string): string {
  // TODO
  return '';
}
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'lib/cookie.ts',
        pattern: 'encodeURIComponent(',
        message: '쿠키 값은 encodeURIComponent()로 인코딩해야 합니다. 값에 ;가 섞이면 헤더 인젝션이 발생합니다.'
      },
      {
        type: 'includes',
        target: 'lib/cookie.ts',
        pattern: 'HttpOnly',
        message: 'JavaScript에서 토큰을 읽지 못하도록 HttpOnly 속성을 추가하세요.'
      },
      {
        type: 'regex',
        target: 'lib/cookie.ts',
        pattern: /SameSite=(Lax|Strict)/,
        message: 'CSRF 완화를 위해 SameSite=Lax 속성을 추가하세요.'
      }
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'lib/cookie.ts',
        functionName: 'serializeAuthCookie',
        cases: [
          {
            description: '기본 액세스 토큰 쿠키',
            args: ['access_token', 'abc.def.ghi', 900],
            expected: 'access_token=abc.def.ghi; Path=/; Max-Age=900; HttpOnly; Secure; SameSite=Lax'
          },
          {
            description: '특수문자가 섞인 값 인코딩',
            args: ['sid', 'a b;c', 60],
            expected: 'sid=a%20b%3Bc; Path=/; Max-Age=60; HttpOnly; Secure; SameSite=Lax'
          }
        ]
      },
      {
        target: 'lib/cookie.ts',
        functionName: 'clearAuthCookie',
        cases: [
          {
            description: '쿠키 삭제 헤더',
            args: ['access_token'],
            expected: 'access_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax'
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '조각들을 배열에 담은 뒤 `.join(\'; \')`로 이어 붙이면 순서를 실수하지 않습니다.'
    },
    {
      level: 2,
      content: '`clearAuthCookie`는 `serializeAuthCookie(name, \'\', 0)`을 재사용하면 한 줄로 끝납니다. 빈 문자열은 인코딩해도 빈 문자열입니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function serializeAuthCookie(name: string, value: string, maxAgeSec: number): string {
  return [
    \`\${name}=\${encodeURIComponent(value)}\`,
    'Path=/',
    \`Max-Age=\${maxAgeSec}\`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax'
  ].join('; ');
}

export function clearAuthCookie(name: string): string {
  return serializeAuthCookie(name, '', 0);
}
`
    }
  ]
}
