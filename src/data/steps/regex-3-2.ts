import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_2: CurriculumStep = {
  id: 'regex-3-2',
  title: '정규식 고급 · URL 파싱과 분해',
  order: 213,
  category: 'advanced',
  content: {
    mission:
      'URL 문자열을 파싱하여 각 구성 요소를 추출하는 `parseUrl(url: string): UrlComponents | null` 함수를 작성하세요.\n\n예: `"https://user:pass@api.example.com:8080/v1/users?page=1&limit=20#section"` → `{ protocol, username, password, host, port, path, query, fragment }`',
    theory: `
## URL 구조와 정규식 파싱

URL은 여러 선택적 구성요소로 이루어집니다:
\`protocol://[user:pass@]host[:port]/path[?query][#fragment]\`

### ① URL 구조 예시

\`\`\`ts
const urls = [
  'https://example.com',                          // 기본
  'http://localhost:3000/api',                     // 포트 포함
  'ftp://user:secret@files.server.net/data.csv',  // 인증정보 포함
  'https://shop.com/search?q=shoes&size=42#top',  // 쿼리 + 프래그먼트
];
\`\`\`

### ② 선택적 그룹 — ?를 그룹 뒤에 붙이기

\`\`\`ts
// (?:user:pass@)?  → 인증정보가 있을 수도 없을 수도
// (:port)?         → 포트가 있을 수도 없을 수도
// (/path)?         → 경로가 있을 수도 없을 수도

const urlRegex = /^(?<protocol>https?|ftp):\\/\\//;
// 기본 프로토콜 부분만 먼저 확인
\`\`\`

### ③ 인증정보 추출 패턴

\`\`\`ts
// user:pass@ 부분은 선택적 — (?:...)?
// user와 pass는 각각 캡처
const authRegex = /(?:(?<user>[^:@]+):(?<pass>[^@]+)@)?/;

// 인증정보 있음
'user:pass@'.match(authRegex)?.groups;
// { user: 'user', pass: 'pass' }

// 인증정보 없음
'example.com'.match(authRegex)?.groups;
// { user: undefined, pass: undefined }
\`\`\`

### ④ 호스트 + 포트 분리

\`\`\`ts
// host:port — 포트는 선택적
const hostRegex = /(?<host>[^/:?#]+)(?::(?<port>\\d+))?/;

'api.example.com:8080'.match(hostRegex)?.groups;
// { host: 'api.example.com', port: '8080' }

'example.com'.match(hostRegex)?.groups;
// { host: 'example.com', port: undefined }
\`\`\`

### ⑤ 경로, 쿼리, 프래그먼트 — 순서 중요

\`\`\`ts
// (?<path>/[^?#]*)? — 슬래시로 시작, ? 또는 # 전까지
// (?:\\?(?<query>[^#]*))?  — ? 이후 # 전까지
// (?:#(?<fragment>.*))?  — # 이후 전체

// 쿼리 파라미터를 객체로 파싱
function parseQuery(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
}
parseQuery('page=1&limit=20&sort=desc');
// { page: '1', limit: '20', sort: 'desc' }
\`\`\`

### ⑥ 완성된 URL 정규식

\`\`\`ts
const urlRegex = new RegExp(
  '^(?<protocol>[a-z]+)://' +
  '(?:(?<username>[^:@]+):(?<password>[^@]+)@)?' +  // auth (선택)
  '(?<host>[^/:?#]+)' +                              // 호스트
  '(?::(?<port>\\\\d+))?' +                           // 포트 (선택)
  '(?<path>/[^?#]*)?' +                              // 경로 (선택)
  '(?:\\\\?(?<query>[^#]*))?' +                       // 쿼리 (선택)
  '(?:#(?<fragment>.*))?$'                            // 프래그먼트 (선택)
);
\`\`\`
    `,
    objectives: [
      'Named 캡처 그룹으로 URL의 각 구성 요소를 의미 있는 이름으로 추출할 것',
      '선택적 구성 요소(인증정보, 포트, 경로, 쿼리, 프래그먼트)를 `(?:...)?` 패턴으로 처리할 것',
      '`match.groups`에서 값을 읽어 `UrlComponents` 객체를 반환할 것'
    ],
    exercise: `
1. 위에서 제공한 완성된 URL 정규식을 활용하거나 직접 Named 캡처 그룹 기반 정규식을 작성하세요.
2. \`url.match(regex)\`로 파싱하고, 실패 시 \`null\`을 반환하세요.
3. \`match.groups\`에서 각 필드를 읽어 \`UrlComponents\` 객체를 반환하세요.
   - \`port\`는 숫자 또는 \`undefined\`로 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface UrlComponents {
  protocol: string;
  username?: string;
  password?: string;
  host: string;
  port?: number;
  path?: string;
  query?: string;
  fragment?: string;
}

export function parseUrl(url: string): UrlComponents | null {
  // Named 캡처 그룹으로 URL 각 구성 요소를 추출하세요.
  const regex = /^(?<protocol>[a-z]+):\\/\\/(?:(?<username>[^:@]+):(?<password>[^@]+)@)?(?<host>[^/:?#]+)(?::(?<port>\\d+))?(?<path>\\/[^?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/;

  const match = url.match(regex);
  if (!match?.groups) return null;

  // match.groups에서 필드를 읽어 반환하세요.
  return null;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?<protocol>/,
        message: 'protocol Named 캡처 그룹을 포함해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?<host>/,
        message: 'host Named 캡처 그룹을 포함해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'match.groups',
        message: 'match.groups를 통해 Named 그룹 값을 읽어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`match.groups`에서 구조 분해 할당을 활용하면 간결하게 작성할 수 있습니다: `const { protocol, username, host, port, path, query, fragment } = match.groups;`'
    },
    {
      level: 2,
      content: '`port`는 문자열이므로 숫자로 변환하되, 없을 경우(`undefined`) 그대로 `undefined`를 반환하세요: `port ? Number(port) : undefined`'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function parseUrl(url: string): UrlComponents | null {
  const regex = /^(?<protocol>[a-z]+):\\/\\/(?:(?<username>[^:@]+):(?<password>[^@]+)@)?(?<host>[^/:?#]+)(?::(?<port>\\d+))?(?<path>\\/[^?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/;
  const match = url.match(regex);
  if (!match?.groups) return null;
  const { protocol, username, password, host, port, path, query, fragment } = match.groups;
  return {
    protocol,
    username: username ?? undefined,
    password: password ?? undefined,
    host,
    port: port ? Number(port) : undefined,
    path: path ?? undefined,
    query: query ?? undefined,
    fragment: fragment ?? undefined,
  };
}`
    }
  ]
}
