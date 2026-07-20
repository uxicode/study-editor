import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_5: CurriculumStep = {
  id: 'regex-1-5',
  title: '정규식 기초 · 플래그 (Flags)',
  order: 204,
  category: 'advanced',
  content: {
    mission:
      '주어진 HTML 문자열에서 모든 이메일 주소를 대소문자 구분 없이 추출하고, 각 이메일의 도메인 이름만 소문자로 정규화하여 중복 없이 배열로 반환하는 `extractUniqueDomains(html: string): string[]` 함수를 작성하세요. 예: `"Contact Admin@Example.com or support@example.com"` → `["example.com"]`',
    theory: `
## 정규식 플래그(Flags) — 동작 방식 제어

플래그는 정규식 리터럴의 닫는 슬래시 뒤에 붙입니다: \`/pattern/flags\`

### ① g — Global (전체 검색)

\`g\` 없이는 첫 번째 매칭만 반환, \`g\`가 있으면 **모든 매칭**을 반환합니다.

\`\`\`ts
// g 없음: 첫 번째 숫자만
'a1b2c3'.match(/\\d/);    // ['1']

// g 있음: 모든 숫자
'a1b2c3'.match(/\\d/g);   // ['1', '2', '3']

// replace에서도 g 플래그가 중요
'aabbcc'.replace(/a/, 'x');    // 'xabbcc' (첫 번째만 교체)
'aabbcc'.replace(/a/g, 'x');   // 'xxbbcc' (모두 교체)
\`\`\`

### ② i — Case-Insensitive (대소문자 무시)

\`\`\`ts
/hello/i.test('Hello');    // true
/hello/i.test('HELLO');    // true
/hello/i.test('hElLo');    // true

// 대소문자 구분 없이 이메일 도메인 추출
const emails = 'user@Example.com admin@EXAMPLE.COM'.match(/[\\w.]+@[\\w.]+/gi);
// ['user@Example.com', 'admin@EXAMPLE.COM']
\`\`\`

### ③ m — Multiline (다중 줄 모드)

\`m\` 플래그 없이 \`^\`와 \`$\`는 전체 문자열의 시작/끝을 의미합니다.
\`m\` 플래그를 쓰면 각 **줄**의 시작/끝을 의미합니다.

\`\`\`ts
const log = \`[INFO] 서버 시작
[ERROR] 연결 실패
[INFO] 재시도 중\`;

// m 없음: 전체 문자열이 [INFO]로 시작하지 않으므로 null
log.match(/^\\[INFO\\].+/);    // null

// m 있음: 각 줄에서 [INFO]로 시작하는 것 찾음
log.match(/^\\[INFO\\].+/mg);  // ['[INFO] 서버 시작', '[INFO] 재시도 중']
\`\`\`

### ④ s — DotAll (줄바꿈 포함)

기본적으로 \`.\`는 줄바꿈(\`\\n\`)을 포함하지 않습니다.
\`s\` 플래그를 쓰면 \`.\`가 줄바꿈까지 매칭합니다.

\`\`\`ts
const text = 'line1\\nline2';
/line1.line2/.test(text);    // false (. 이 \\n 를 포함하지 않음)
/line1.line2/s.test(text);   // true  (s 플래그로 \\n 포함)
\`\`\`

### ⑤ 플래그 조합 사용

플래그는 여러 개를 동시에 사용할 수 있습니다.

\`\`\`ts
// gi: 대소문자 무시 + 전체 검색
'Hello World hello'.match(/hello/gi);  // ['Hello', 'hello']

// gm: 전체 검색 + 멀티라인
const code = \`const a = 1;\\nconst b = 2;\\nlet c = 3;\`;
code.match(/^const .+/gm);  // ['const a = 1;', 'const b = 2;']
\`\`\`

### ⑥ 중복 제거 패턴 (Set 활용)

\`\`\`ts
const texts = ['apple', 'Apple', 'APPLE'];
// Set은 참조 기반으로 동작하므로 먼저 소문자로 통일
const unique = [...new Set(texts.map(t => t.toLowerCase()))];
// ['apple']
\`\`\`
    `,
    objectives: [
      '`gi` 플래그를 사용하여 대소문자 구분 없이 이메일을 전역 검색할 것',
      '추출된 이메일에서 `@` 뒤 도메인 부분만 소문자로 변환하여 추출할 것',
      '`Set`이나 `filter` + `indexOf`를 활용하여 중복 도메인을 제거할 것'
    ],
    exercise: `
1. \`extractUniqueDomains\` 함수 내부에서 이메일 패턴을 \`gi\` 플래그로 선언하고 \`html.match(regex)\`로 모든 이메일을 추출하세요.
2. 추출된 이메일 배열을 \`map()\`으로 순회하며 \`@\` 뒤 도메인 부분(\`split('@')[1]\`)을 소문자로 변환하세요.
3. \`Set\`을 활용해 중복을 제거하고 배열로 반환하세요. 이메일이 없으면 빈 배열을 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function extractUniqueDomains(html: string): string[] {
  // gi 플래그로 이메일을 모두 추출하고, 도메인만 소문자로 정규화하여 중복 제거 후 반환하세요.
  const emailRegex = /[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}/gi;
  const matches = html.match(emailRegex);
  if (!matches) return [];
  
  // 도메인 추출 + 소문자화 + 중복 제거
  return [];
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\/[^/]+\/gi/,
        message: 'gi 플래그를 포함한 정규식을 사용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.toLowerCase()',
        message: '도메인을 소문자로 정규화하기 위해 toLowerCase()를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /new Set|\.filter\(/,
        message: 'Set 또는 filter()를 사용하여 중복을 제거해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`html.match(/[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}/gi)`로 모든 이메일을 추출하세요. 결과가 null이면 빈 배열을 반환하세요.'
    },
    {
      level: 2,
      content: '각 이메일에서 도메인을 추출하려면 `email.split(\'@\')[1].toLowerCase()`를 사용하세요. 그 뒤 `new Set(domains)`으로 중복을 제거하고 `[...set]`으로 배열로 변환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function extractUniqueDomains(html: string): string[] {
  const emailRegex = /[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}/gi;
  const matches = html.match(emailRegex);
  if (!matches) return [];
  const domains = matches.map(email => email.split('@')[1].toLowerCase());
  return [...new Set(domains)];
}`
    }
  ]
}
