import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_2: CurriculumStep = {
  id: 'regex-2-2',
  title: '정규식 중급 · 비캡처 그룹과 교대(Alternation)',
  order: 207,
  category: 'advanced',
  content: {
    mission:
      '문자열이 유효한 URL인지 검사하는 `isValidUrl(url: string): boolean` 함수를 작성하세요. `http://`, `https://`, `ftp://` 프로토콜을 모두 허용하며 도메인과 선택적 경로를 포함해야 합니다. 비캡처 그룹 `(?:...)` 과 교대 연산자 `|`를 활용하세요.',
    theory: `
## 비캡처 그룹 (?:...) 과 교대 연산자 |

### ① 캡처 그룹 vs 비캡처 그룹

일반 \`()\`는 매칭된 내용을 **기억(캡처)** 합니다 → 메모리 비용 발생.
\`(?:)\`는 그룹화만 하고 **캡처하지 않습니다** → 성능상 유리.

\`\`\`ts
// 캡처 그룹: match() 결과에 그룹이 포함됨
'2024-07'.match(/(\\d{4})-(\\d{2})/);
// ['2024-07', '2024', '07']  ← 인덱스 1, 2에 캡처값 포함

// 비캡처 그룹: match() 결과에 그룹이 없음
'2024-07'.match(/(?:\\d{4})-(?:\\d{2})/);
// ['2024-07']  ← 전체 매칭만
\`\`\`

### ② 교대 연산자 | (OR)

\`|\`는 **"이것 또는 저것"** 을 의미합니다.
우선순위가 낮으므로 그룹과 함께 사용하는 것이 일반적입니다.

\`\`\`ts
// cat 또는 dog 매칭
/cat|dog/.test('I have a cat');    // true
/cat|dog/.test('I have a dog');    // true
/cat|dog/.test('I have a bird');   // false

// 주의: 그룹 없이 쓰면 범위가 달라짐
// "the cat" 또는 "a dog" 이 아닌  "the cat" 또는 "a" + "dog" 으로 해석
/the cat|a dog/.test('the dog');  // false (의도대로 동작)
/the (cat|dog)/.test('the dog');  // true  (그룹으로 범위 제한)
\`\`\`

### ③ 비캡처 그룹 + 교대 — 프로토콜 예시

\`\`\`ts
// http, https, ftp 중 하나 허용
const proto = /^(?:https?|ftp):\\/\\//;

proto.test('http://example.com');   // true
proto.test('https://example.com');  // true
proto.test('ftp://example.com');    // true
proto.test('ssh://example.com');    // false
\`\`\`

### ④ https? 패턴 — ? 수량자 활용

\`\`\`ts
// https? = http 또는 https (s가 선택적)
/https?/.test('http');   // true
/https?/.test('https');  // true
/https?/.test('httpss'); // false (s가 두 개)

// ftp를 추가하려면 교대 필요
/(?:https?|ftp)/.test('ftp');    // true
/(?:https?|ftp)/.test('https');  // true
\`\`\`

### ⑤ URL 패턴 전체 조합

\`\`\`ts
const urlRegex = /^(?:https?|ftp):\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:\\/[^\\s]*)?$/;
//               ^──────────────── ^──────────────────────────── ^────────────$
//               프로토콜           도메인 (호스트)                 경로 (선택)

urlRegex.test('https://example.com');          // true
urlRegex.test('http://sub.example.co.kr');     // true
urlRegex.test('ftp://files.server.net/path');  // true
urlRegex.test('example.com');                  // false (프로토콜 없음)
urlRegex.test('https://');                     // false (도메인 없음)
\`\`\`

### ⑥ 교대를 활용한 파일 확장자 검사

\`\`\`ts
const imageRegex = /\\.(?:jpg|jpeg|png|gif|webp)$/i;

imageRegex.test('photo.jpg');    // true
imageRegex.test('photo.JPEG');   // true  (i 플래그)
imageRegex.test('photo.pdf');    // false
imageRegex.test('photo.png');    // true
\`\`\`
    `,
    objectives: [
      '`(?:https?|ftp)` 비캡처 그룹과 교대 연산자로 복수 프로토콜을 허용할 것',
      '도메인 부분을 `[\\\\w.-]+` 패턴으로 표현할 것',
      '경로 부분을 선택적(`?` 수량자)으로 처리할 것'
    ],
    exercise: `
1. \`isValidUrl\` 함수 내부에서 프로토콜(\`http\`, \`https\`, \`ftp\`), 도메인, 선택적 경로를 포함한 정규식을 선언하세요.
2. 프로토콜 부분에는 비캡처 그룹 \`(?:...)\`과 교대 \`|\`를 사용하세요.
3. \`regex.test(url)\` 결과를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function isValidUrl(url: string): boolean {
  // http, https, ftp 프로토콜을 허용하는 URL 검증
  // (?:https?|ftp) 비캡처 그룹과 교대를 활용하세요.
  return false;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?:/,
        message: '비캡처 그룹 (?:...) 을 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /https?\|ftp|ftp\|https?/,
        message: '교대 연산자(|)로 http, https, ftp 프로토콜을 모두 허용해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.test(',
        message: 'test() 메서드를 사용하여 결과를 반환해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '프로토콜 부분은 `(?:https?|ftp)://`로 표현합니다. `https?`는 http와 https를 모두 허용하고, `|ftp`로 ftp도 추가합니다.'
    },
    {
      level: 2,
      content: '도메인 부분은 `[\\w.-]+\\.[a-zA-Z]{2,}`로, 선택적 경로는 `(?:/[^\\s]*)?`로 표현합니다. 전체를 `^...$`로 감싸세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function isValidUrl(url: string): boolean {
  const regex = /^(?:https?|ftp):\\/\\/[\\w.-]+(?:\\.[a-zA-Z]{2,})(?:\\/[^\\s]*)?$/;
  return regex.test(url);
}`
    }
  ]
}
