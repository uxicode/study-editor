import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_1: CurriculumStep = {
  id: 'regex-3-1',
  title: '정규식 고급 · Named 캡처 그룹과 탐욕/비탐욕 매칭',
  order: 212,
  category: 'advanced',
  content: {
    mission:
      'Nginx 액세스 로그 한 줄을 파싱하여 구조화된 객체로 반환하는 `parseNginxLog(line: string): NginxLogEntry | null` 함수를 작성하세요. Named 캡처 그룹(`(?<name>...)`)을 활용하여 `ip`, `timestamp`, `method`, `path`, `status`, `bytes` 필드를 추출하세요.\n\n로그 예시: `127.0.0.1 - - [20/Jul/2026:10:30:00 +0900] "GET /api/users HTTP/1.1" 200 4566`',
    theory: `
## Named 캡처 그룹 (?<name>...) 과 탐욕/비탐욕 매칭

### ① Named 캡처 그룹 기본

\`\`\`ts
// 이름 없는 일반 캡처 그룹: 숫자 인덱스로 접근
const r1 = '2024-07'.match(/(\\d{4})-(\\d{2})/);
r1?.[1];  // '2024' — 이름 없어 인덱스만 사용 가능

// Named 캡처 그룹: 의미 있는 이름으로 접근
const r2 = '2024-07'.match(/(?<year>\\d{4})-(?<month>\\d{2})/);
r2?.groups?.year;   // '2024'
r2?.groups?.month;  // '07'
\`\`\`

### ② Named 그룹 — replace() 에서 활용

\`\`\`ts
// $<name> 문법으로 named 그룹 참조
'2024-07-20'.replace(
  /(?<y>\\d{4})-(?<m>\\d{2})-(?<d>\\d{2})/,
  '$<d>/$<m>/$<y>'
);
// '20/07/2024'
\`\`\`

### ③ 탐욕(Greedy) 매칭 — 기본 동작

정규식 수량자(\`+\`, \`*\`, \`{n,m}\`)는 기본적으로 **탐욕적**으로, 최대한 길게 매칭합니다.

\`\`\`ts
const html = '<span>Hello</span> <span>World</span>';

// 탐욕: 첫 <span>부터 마지막 </span>까지 한 번에 삼킴
html.match(/<span>.+<\\/span>/)?.[0];
// '<span>Hello</span> <span>World</span>'  ← 전체가 매칭됨
\`\`\`

### ④ 비탐욕(Lazy/Non-greedy) 매칭 — ? 접미사

수량자 뒤에 \`?\`를 붙이면 **최소한으로** 매칭합니다.

\`\`\`ts
const html = '<span>Hello</span> <span>World</span>';

// 비탐욕: 첫 번째 닫힘 태그에서 멈춤
html.match(/<span>.+?<\\/span>/)?.[0];
// '<span>Hello</span>'  ← 첫 번째만 매칭

// g 플래그로 모두 추출
html.match(/<span>.+?<\\/span>/g);
// ['<span>Hello</span>', '<span>World</span>']
\`\`\`

### ⑤ 비탐욕 수량자 종류

| 탐욕    | 비탐욕   | 의미              |
|---------|----------|-------------------|
| \`+\`   | \`+?\`   | 1번 이상 (최소한) |
| \`*\`   | \`*?\`   | 0번 이상 (최소한) |
| \`?\`   | \`??\`   | 0 또는 1 (최소한) |
| \`{n,m}\` | \`{n,m}?\` | n~m번 (최소한) |

\`\`\`ts
// 탐욕 vs 비탐욕 비교
'"hello" and "world"'.match(/".*"/)?.[0];   // '"hello" and "world"' (탐욕)
'"hello" and "world"'.match(/".*?"/)?.[0];  // '"hello"'             (비탐욕)
\`\`\`

### ⑥ Nginx 로그 패턴 설계

\`\`\`ts
// 형식: IP - - [타임스탬프] "메서드 경로 프로토콜" 상태코드 바이트
const nginxRegex = new RegExp(
  '^(?<ip>\\\\S+)' +           // IP 주소
  ' - - ' +
  '\\\\[(?<ts>.+?)\\\\] ' +    // [타임스탬프] — 비탐욕으로 ] 전까지
  '"(?<method>\\\\w+) ' +      // HTTP 메서드
  '(?<path>\\\\S+) ' +         // 경로
  'HTTP\\\\/[\\\\d.]+" ' +     // 프로토콜 버전
  '(?<status>\\\\d{3}) ' +     // 상태코드
  '(?<bytes>\\\\d+)$'          // 바이트 수
);
\`\`\`
    `,
    objectives: [
      '`(?<name>...)` Named 캡처 그룹으로 각 필드를 의미 있는 이름으로 추출할 것',
      '타임스탬프처럼 내용이 유동적인 필드에는 비탐욕 `.+?`를 사용할 것',
      '`match.groups`에서 Named 그룹 값을 읽어 객체를 구성하여 반환할 것'
    ],
    exercise: `
1. Nginx 로그 패턴을 Named 캡처 그룹으로 설계하세요.
   - ip, timestamp, method, path, status, bytes 필드를 Named 그룹으로 지정하세요.
2. \`line.match(regex)\`로 파싱하고, 매칭에 실패하면 \`null\`을 반환하세요.
3. 성공 시 \`match.groups\`에서 각 필드 값을 읽어 \`NginxLogEntry\` 객체를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface NginxLogEntry {
  ip: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  bytes: number;
}

export function parseNginxLog(line: string): NginxLogEntry | null {
  // Named 캡처 그룹을 사용하여 로그를 파싱하세요.
  // 예: 127.0.0.1 - - [20/Jul/2026:10:30:00 +0900] "GET /api/users HTTP/1.1" 200 4566
  const regex = /^(?<ip>\\S+) - - \\[(?<timestamp>.+?)\\] "(?<method>\\w+) (?<path>\\S+) HTTP\\/[\\d.]+" (?<status>\\d{3}) (?<bytes>\\d+)$/;
  
  const match = line.match(regex);
  if (!match || !match.groups) return null;

  // match.groups에서 각 필드를 읽어 객체를 반환하세요.
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
        pattern: /\(\?<\w+>/,
        message: 'Named 캡처 그룹 (?<name>...) 을 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'match.groups',
        message: 'match.groups를 통해 Named 그룹 값을 접근해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /Number\(|parseInt\(/,
        message: 'status와 bytes는 숫자형으로 변환(Number() 또는 parseInt())하여 반환해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`match.groups`는 Named 그룹 이름을 키로 하는 객체입니다. `match.groups.ip`, `match.groups.status` 처럼 접근하세요.'
    },
    {
      level: 2,
      content: '`status`와 `bytes`는 문자열로 추출되므로 `Number(match.groups.status)` 또는 `parseInt(match.groups.bytes, 10)`으로 숫자로 변환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function parseNginxLog(line: string): NginxLogEntry | null {
  const regex = /^(?<ip>\\S+) - - \\[(?<timestamp>.+?)\\] "(?<method>\\w+) (?<path>\\S+) HTTP\\/[\\d.]+" (?<status>\\d{3}) (?<bytes>\\d+)$/;
  const match = line.match(regex);
  if (!match?.groups) return null;
  const { ip, timestamp, method, path, status, bytes } = match.groups;
  return {
    ip,
    timestamp,
    method,
    path,
    status: Number(status),
    bytes: Number(bytes),
  };
}`
    }
  ]
}
