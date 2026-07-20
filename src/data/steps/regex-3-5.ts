import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_5: CurriculumStep = {
  id: 'regex-3-5',
  title: '정규식 고급 · 로그 분석기 (집계 및 통계)',
  order: 216,
  category: 'advanced',
  content: {
    mission:
      '여러 줄의 Nginx 액세스 로그를 분석하여 통계를 반환하는 `analyzeAccessLogs(logs: string[]): LogStats` 함수를 작성하세요.\n\n반환 형식:\n- `statusCounts`: 상태 코드별 요청 수 `{ "200": 10, "404": 2 }`\n- `topPaths`: 요청 수 기준 상위 5개 경로 (내림차순)\n- `errorRate`: 4xx, 5xx 응답 비율 (0~1 사이 소수)',
    theory: `
## 정규식 + 데이터 집계 파이프라인

### ① 로그 파싱 + reduce() 집계 조합

\`\`\`ts
// 상태코드 추출 후 집계
const statusRegex = /" (\\d{3}) /;
logs.reduce((acc, log) => {
  const match = log.match(statusRegex);
  if (match) {
    const code = match[1];
    acc[code] = (acc[code] || 0) + 1;
  }
  return acc;
}, {} as Record<string, number>);
\`\`\`

### ② 경로 추출 패턴

\`\`\`ts
// HTTP 메서드 뒤의 경로 추출
// "GET /api/users HTTP/1.1" → '/api/users'
const pathRegex = /"[A-Z]+ (\\S+) HTTP/;
const path = log.match(pathRegex)?.[1];  // '/api/users'
\`\`\`

### ③ 빈도 집계 → 정렬 → 상위 N개 추출

\`\`\`ts
const pathCounts: Record<string, number> = {};

// 집계
logs.forEach(log => {
  const match = log.match(/"\\w+ (\\S+) HTTP/);
  if (match) {
    const path = match[1];
    pathCounts[path] = (pathCounts[path] || 0) + 1;
  }
});

// 정렬 후 상위 5개
const topPaths = Object.entries(pathCounts)
  .sort(([, a], [, b]) => b - a)   // 내림차순
  .slice(0, 5)
  .map(([path, count]) => ({ path, count }));
\`\`\`

### ④ 에러율 계산

\`\`\`ts
// 4xx, 5xx 상태 코드 필터링
const totalRequests = logs.length;
const errorCount = logs.filter(log => /" [45]\\d{2} /.test(log)).length;
const errorRate = totalRequests > 0 ? errorCount / totalRequests : 0;
\`\`\`

### ⑤ 정규식과 고차 함수 파이프라인 패턴

\`\`\`ts
// 단계별 처리: 파싱 → 변환 → 집계 → 정렬
const parsed = logs
  .map(log => {
    const m = log.match(/^(\\S+) .* "(\\w+) (\\S+) HTTP\\/[\\d.]+".* (\\d{3}) (\\d+)$/);
    if (!m) return null;
    return { ip: m[1], method: m[2], path: m[3], status: m[4], bytes: Number(m[5]) };
  })
  .filter(Boolean);  // null 제거
\`\`\`

### ⑥ Object.entries() + 정렬 패턴

\`\`\`ts
// 빈도 맵을 정렬된 배열로 변환
function getSortedEntries(map: Record<string, number>): [string, number][] {
  return Object.entries(map).sort(([, a], [, b]) => b - a);
}

// 파괴 분해를 활용한 간결한 정렬
const sorted = Object.entries(freq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
\`\`\`
    `,
    objectives: [
      '정규식으로 각 로그 라인에서 상태 코드와 경로를 추출할 것',
      '`reduce()` 또는 `forEach()`로 상태 코드별 카운트와 경로별 카운트를 집계할 것',
      '경로 빈도 맵을 내림차순 정렬하여 상위 5개를 추출하고, 에러율을 계산하여 반환할 것'
    ],
    exercise: `
1. 각 로그 라인에서 상태 코드(3자리 숫자)와 요청 경로를 정규식으로 추출하세요.
2. \`statusCounts\` 객체와 \`pathCounts\` 객체에 각각 빈도를 누적하세요.
3. \`topPaths\`는 \`pathCounts\`를 내림차순 정렬 후 상위 5개의 경로 문자열 배열로 만드세요.
4. \`errorRate\`는 상태 코드가 4xx 또는 5xx인 로그 수를 전체 로그 수로 나눈 값(0~1)입니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface LogStats {
  statusCounts: Record<string, number>;
  topPaths: string[];
  errorRate: number;
}

export function analyzeAccessLogs(logs: string[]): LogStats {
  const statusCounts: Record<string, number> = {};
  const pathCounts: Record<string, number> = {};

  // 상태 코드 추출 패턴: 요청 구절 뒤에 오는 3자리 숫자
  const statusRegex = /" (\\d{3}) /;
  // 요청 경로 추출 패턴: HTTP 메서드 뒤의 경로
  const pathRegex = /"\\w+ (\\S+) HTTP/;

  logs.forEach(log => {
    // TODO: statusCounts와 pathCounts를 집계하세요.
  });

  // 상위 5개 경로 추출
  const topPaths = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path]) => path);

  // TODO: 에러율을 계산하세요.
  const errorRate = 0;

  return { statusCounts, topPaths, errorRate };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /statusCounts\[\w+\]\s*=/,
        message: 'statusCounts 객체에 상태 코드별 카운트를 누적해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /pathCounts\[\w+\]\s*=/,
        message: 'pathCounts 객체에 경로별 카운트를 누적해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\[45\]\\d\{2\}|\[45\]\\.d/,
        message: '4xx, 5xx 상태 코드를 정규식으로 필터링하여 에러율을 계산해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`forEach` 콜백 안에서 `log.match(statusRegex)?.[1]`로 상태 코드를 추출하고 `statusCounts[code] = (statusCounts[code] || 0) + 1;`으로 누적하세요.'
    },
    {
      level: 2,
      content: '에러율은 `const errorCount = logs.filter(log => /" [45]\\d{2} /.test(log)).length;`로 구하고, `logs.length > 0 ? errorCount / logs.length : 0`으로 계산하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function analyzeAccessLogs(logs: string[]): LogStats {
  const statusCounts: Record<string, number> = {};
  const pathCounts: Record<string, number> = {};
  const statusRegex = /" (\\d{3}) /;
  const pathRegex = /"\\w+ (\\S+) HTTP/;

  logs.forEach(log => {
    const statusMatch = log.match(statusRegex);
    if (statusMatch) {
      const code = statusMatch[1];
      statusCounts[code] = (statusCounts[code] || 0) + 1;
    }
    const pathMatch = log.match(pathRegex);
    if (pathMatch) {
      const path = pathMatch[1];
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    }
  });

  const topPaths = Object.entries(pathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([path]) => path);

  const errorCount = logs.filter(log => /" [45]\\d{2} /.test(log)).length;
  const errorRate = logs.length > 0 ? errorCount / logs.length : 0;

  return { statusCounts, topPaths, errorRate };
}`
    }
  ]
}
