import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_4: CurriculumStep = {
  id: 'regex-2-4',
  title: '정규식 중급 · String 메서드 심화 (matchAll, split, search)',
  order: 209,
  category: 'advanced',
  content: {
    mission:
      '마크다운 텍스트에서 모든 링크 정보를 추출하는 `extractLinks(markdown: string): Array<{ text: string; url: string }>` 함수를 작성하세요. 마크다운 링크 형식은 `[링크 텍스트](URL)` 입니다. `matchAll()`과 캡처 그룹을 활용하세요.',
    theory: `
## 정규식과 함께 쓰는 String 메서드 총정리

### ① match() — 매칭 결과 배열 반환

\`\`\`ts
// g 플래그 없음: 첫 번째 매칭 + 캡처 그룹 + index, input 정보
const r1 = '2024-07-20'.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
r1?.[0];  // '2024-07-20' (전체 매칭)
r1?.[1];  // '2024'       (그룹 1)
r1?.[2];  // '07'         (그룹 2)

// g 플래그 있음: 모든 전체 매칭만 (캡처 그룹 정보 없음!)
'1px 2em 3rem'.match(/\\d+/g);  // ['1', '2', '3']
\`\`\`

### ② matchAll() — 반복자로 모든 매칭 + 캡처 그룹 정보

\`g\` 플래그 + \`match()\`는 캡처 그룹 정보를 잃습니다.
\`matchAll()\`은 **모든 매칭마다 캡처 그룹 정보를 포함**합니다.

\`\`\`ts
const regex = /\\[(.*?)\\]\\((.*?)\\)/g;  // 마크다운 링크 패턴
const md = '[Google](https://google.com) and [Naver](https://naver.com)';

for (const match of md.matchAll(regex)) {
  console.log(match[0]);  // '[Google](https://google.com)' — 전체 매칭
  console.log(match[1]);  // 'Google'                       — 그룹 1 (텍스트)
  console.log(match[2]);  // 'https://google.com'           — 그룹 2 (URL)
}

// 배열로 변환
const links = [...md.matchAll(regex)].map(m => ({ text: m[1], url: m[2] }));
\`\`\`

### ③ search() — 첫 번째 매칭 위치(index) 반환

\`\`\`ts
// 매칭되면 0 이상의 인덱스, 없으면 -1
'hello world'.search(/world/);    // 6
'hello world'.search(/xyz/);      // -1

// 매칭 여부만 확인할 때는 test()가 더 적합, 위치가 필요할 때 search()
const logLine = '[ERROR] 서버 오류 발생';
if (logLine.search(/\\[ERROR\\]/) === 0) {
  console.log('에러 로그 감지!');
}
\`\`\`

### ④ split() — 정규식으로 문자열 분할

\`\`\`ts
// 하나 이상의 공백으로 분리
'foo   bar\\t  baz'.split(/\\s+/);  // ['foo', 'bar', 'baz']

// 구두점으로 분리 (마침표, 쉼표, 세미콜론)
'one,two;three.four'.split(/[,;.]/);  // ['one', 'two', 'three', 'four']

// 캡처 그룹을 포함한 split: 구분자 자체도 결과에 포함
'a1b2c3'.split(/(\\d)/);  // ['a', '1', 'b', '2', 'c', '3', '']
\`\`\`

### ⑤ replace() / replaceAll() — 치환

\`\`\`ts
// replace() + 정규식: g 플래그로 전체 치환
'hello world'.replace(/o/g, '0');   // 'hell0 w0rld'

// replace() + 함수: 동적 치환
'2024-07-20'.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, (_, y, m, d) => \`\${d}/\${m}/\${y}\`);
// '20/07/2024'

// replaceAll() (ES2021): 문자열을 전체 치환 (정규식의 g 플래그와 동일)
'a.b.c'.replaceAll('.', '/');   // 'a/b/c'
'a.b.c'.replace(/\\./g, '/');   // 'a/b/c'  (동일한 결과)
\`\`\`

### ⑥ 비탐욕 매칭 .+? 활용 — matchAll과 조합

\`\`\`ts
// 마크다운 코드 블록 \`...\` 내용 추출
const codeRegex = /\`(.+?)\`/g;
const md = '\`foo\` and \`bar baz\`';
[...md.matchAll(codeRegex)].map(m => m[1]);  // ['foo', 'bar baz']
\`\`\`
    `,
    objectives: [
      '마크다운 링크 패턴 `\\\\[(.+?)\\\\]\\\\((.+?)\\\\)` 을 `g` 플래그와 함께 선언할 것',
      '`matchAll()`을 사용하여 모든 링크의 캡처 그룹 정보를 순회할 것',
      '결과를 `{ text, url }` 객체 배열로 변환하여 반환할 것'
    ],
    exercise: `
1. \`extractLinks\` 함수 내부에서 마크다운 링크 패턴 \`/\\\\[(.+?)\\\\]\\\\((.+?)\\\\)/g\`를 선언하세요.
   - 그룹 1: 대괄호 안의 텍스트, 그룹 2: 소괄호 안의 URL
2. \`markdown.matchAll(regex)\`로 반복자를 받고 스프레드 연산자 \`[...]\`로 배열로 변환하세요.
3. \`map()\`으로 각 매칭 결과를 \`{ text: match[1], url: match[2] }\` 형태로 변환하여 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface LinkInfo {
  text: string;
  url: string;
}

export function extractLinks(markdown: string): LinkInfo[] {
  // 마크다운 링크 패턴: [텍스트](URL)
  // matchAll()을 사용하여 모든 링크를 추출하세요.
  const regex = /\\[(.+?)\\]\\((.+?)\\)/g;
  return [];
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.matchAll(',
        message: 'matchAll() 메서드를 사용하여 모든 매칭과 캡처 그룹을 추출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /match\[1\]|m\[1\]/,
        message: '캡처 그룹 인덱스(match[1], match[2])를 사용하여 텍스트와 URL을 추출해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`markdown.matchAll(regex)`는 반복자(iterator)를 반환합니다. `[...markdown.matchAll(regex)]`로 배열로 변환한 뒤 `map()`을 적용하세요.'
    },
    {
      level: 2,
      content: '각 매칭 객체에서 `match[1]`은 링크 텍스트, `match[2]`는 URL입니다. `map(match => ({ text: match[1], url: match[2] }))`로 변환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function extractLinks(markdown: string): LinkInfo[] {
  const regex = /\\[(.+?)\\]\\((.+?)\\)/g;
  return [...markdown.matchAll(regex)].map(match => ({
    text: match[1],
    url: match[2],
  }));
}`
    }
  ]
}
