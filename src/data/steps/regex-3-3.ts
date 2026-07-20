import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_3: CurriculumStep = {
  id: 'regex-3-3',
  title: '정규식 고급 · RegExp 생성자와 동적 패턴',
  order: 214,
  category: 'advanced',
  content: {
    mission:
      '검색어 목록과 텍스트를 받아 각 검색어가 텍스트에서 몇 번 등장하는지 집계하고, 텍스트에서 모든 검색어를 `<mark>검색어</mark>` 태그로 하이라이팅한 HTML 문자열을 반환하는 `highlightKeywords(text: string, keywords: string[]): { counts: Record<string, number>; highlighted: string }` 함수를 작성하세요.',
    theory: `
## RegExp 생성자와 동적 패턴 생성

### ① 왜 RegExp 생성자가 필요한가?

리터럴 방식(\`/pattern/\`)은 패턴이 **컴파일 시 고정**됩니다.
동적으로 변수를 패턴에 넣으려면 \`new RegExp()\` 생성자가 필요합니다.

\`\`\`ts
const keyword = '자바스크립트';

// ❌ 리터럴 방식으로는 변수를 넣을 수 없음
// /keyword/ → 변수 keyword가 아닌 문자열 'keyword' 자체를 찾음

// ✅ RegExp 생성자로 동적 생성
const regex = new RegExp(keyword, 'gi');
regex.test('자바스크립트는 재미있어요');  // true
\`\`\`

### ② 특수 문자 이스케이프 — 중요!

사용자 입력을 패턴에 넣을 때 특수 문자를 반드시 이스케이프해야 합니다.

\`\`\`ts
// 위험: '.' 이 임의 문자로 해석될 수 있음
const keyword = 'test.js';
new RegExp(keyword).test('testXjs');  // true (의도치 않게!)

// 안전: 특수 문자를 이스케이프
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
  // $& = 매칭된 전체 문자열 (여기서는 특수 문자 하나)
}

const safe = new RegExp(escapeRegex('test.js'), 'g');
safe.test('testXjs');   // false (이제 안전)
safe.test('test.js');   // true
\`\`\`

### ③ 여러 키워드를 교대(|) 패턴으로 합치기

\`\`\`ts
const keywords = ['JavaScript', 'TypeScript', 'React'];
const escaped = keywords.map(k => k.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&'));
const pattern = escaped.join('|');
const regex = new RegExp(pattern, 'gi');

'I love JavaScript and TypeScript!'.match(regex);
// ['JavaScript', 'TypeScript']
\`\`\`

### ④ replace() 콜백으로 하이라이팅

\`\`\`ts
// 매칭된 단어를 <mark> 태그로 감싸기
const highlighted = text.replace(regex, (match) => \`<mark>\${match}</mark>\`);

// 대소문자를 보존하면서 하이라이팅 (i 플래그 사용 시)
'Hello HELLO hello'.replace(/hello/gi, m => \`<mark>\${m}</mark>\`);
// '<mark>Hello</mark> <mark>HELLO</mark> <mark>hello</mark>'
\`\`\`

### ⑤ 빈도 카운팅 + 하이라이팅 동시 처리

\`\`\`ts
// 접근법 1: 키워드별 별도 카운팅
function countKeyword(text: string, keyword: string): number {
  const regex = new RegExp(escapeRegex(keyword), 'gi');
  return (text.match(regex) || []).length;
}

// 접근법 2: replace 콜백에서 동시 카운팅
const counts: Record<string, number> = {};
const highlighted = text.replace(regex, (match) => {
  const lower = match.toLowerCase();
  counts[lower] = (counts[lower] || 0) + 1;
  return \`<mark>\${match}</mark>\`;
});
\`\`\`

### ⑥ XSS 방지 — HTML 이스케이프

사용자 텍스트를 HTML로 출력할 때 XSS 공격을 방지합니다.

\`\`\`ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// 텍스트 먼저 HTML 이스케이프 → 그 후 키워드 하이라이팅
const safePipeline = text => escapeHtml(text);
\`\`\`
    `,
    objectives: [
      '키워드 배열을 특수문자 이스케이프 후 `|`로 합쳐 단일 동적 `RegExp` 패턴을 생성할 것',
      '`replace()` 콜백에서 동시에 카운팅과 하이라이팅을 처리할 것',
      '`{ counts, highlighted }` 형태의 결과 객체를 반환할 것'
    ],
    exercise: `
1. 각 키워드를 특수문자 이스케이프 처리 후 \`|\`로 이어붙인 패턴을 \`new RegExp()\`로 생성하세요.
2. \`text.replace(regex, callback)\`에서 콜백 함수 안에서:
   - 매칭된 단어를 소문자로 변환해 \`counts\` 객체에 카운트를 누적하세요.
   - 매칭된 단어를 \`<mark>단어</mark>\`로 감싸 반환하세요.
3. \`{ counts, highlighted }\`를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface HighlightResult {
  counts: Record<string, number>;
  highlighted: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
}

export function highlightKeywords(text: string, keywords: string[]): HighlightResult {
  if (keywords.length === 0) return { counts: {}, highlighted: text };

  // 1. 키워드를 이스케이프하고 | 로 합쳐 동적 RegExp 생성
  const pattern = keywords.map(escapeRegex).join('|');
  const regex = new RegExp(pattern, 'gi');

  // 2. replace 콜백에서 카운팅과 하이라이팅 동시 처리
  const counts: Record<string, number> = {};
  const highlighted = text; // TODO: replace 로직을 작성하세요.

  return { counts, highlighted };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'new RegExp(',
        message: 'new RegExp() 생성자로 동적 패턴을 생성해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.join(\'|\')',
        message: '키워드를 | 로 합쳐 교대(alternation) 패턴을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /<mark>/,
        message: '매칭된 단어를 <mark> 태그로 감싸야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`text.replace(regex, (match) => { ... })`를 사용하세요. 콜백 안에서 `const lower = match.toLowerCase(); counts[lower] = (counts[lower] || 0) + 1;`으로 카운트하고 `\`<mark>${match}</mark>\``를 반환하세요.'
    },
    {
      level: 2,
      content: '`highlighted` 변수에 replace 결과를 저장해야 합니다: `const highlighted = text.replace(regex, (match) => { ... });`'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function highlightKeywords(text: string, keywords: string[]): HighlightResult {
  if (keywords.length === 0) return { counts: {}, highlighted: text };
  const pattern = keywords.map(escapeRegex).join('|');
  const regex = new RegExp(pattern, 'gi');
  const counts: Record<string, number> = {};
  const highlighted = text.replace(regex, (match) => {
    const lower = match.toLowerCase();
    counts[lower] = (counts[lower] || 0) + 1;
    return \`<mark>\${match}</mark>\`;
  });
  return { counts, highlighted };
}`
    }
  ]
}
