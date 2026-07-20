import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_4: CurriculumStep = {
  id: 'regex-1-4',
  title: '정규식 기초 · 앵커와 단어 경계',
  order: 203,
  category: 'advanced',
  content: {
    mission:
      '텍스트 내에서 특정 단어가 독립적인 단어로 몇 번 등장하는지 세는 `countWordOccurrences(text: string, word: string): number` 함수를 작성하세요. 예: `"the cat sat on the mat"` 에서 `"the"` 검색 시 결과는 `2`여야 합니다. `\\b` 단어 경계와 `RegExp` 생성자를 활용하세요.',
    theory: `
## 앵커(Anchor) — 위치 기반 매칭

앵커는 **문자**가 아닌 **위치**를 나타내므로 어떤 문자도 소비하지 않습니다.

### ① ^ — 문자열(또는 줄)의 시작

\`\`\`ts
/^Hello/.test('Hello, World');   // true  (Hello로 시작)
/^Hello/.test('Say Hello');      // false (Hello가 시작이 아님)

// m 플래그(multiline)와 함께 쓰면 각 줄의 시작을 의미
const text = \`첫째 줄\\n둘째 줄\\n셋째 줄\`;
text.match(/^.+/mg);  // ['첫째 줄', '둘째 줄', '셋째 줄']
\`\`\`

### ② $ — 문자열(또는 줄)의 끝

\`\`\`ts
/\\.js$/.test('index.js');    // true  (.js로 끝남)
/\\.js$/.test('index.jsx');   // false

// 빈 줄 감지 (^ 와 $ 가 연속)
/^$/.test('');       // true  (빈 문자열)
/^$/.test(' ');      // false (공백이 있으면 빈 줄 아님)
\`\`\`

### ③ \\b — 단어 경계(Word Boundary)

\\b는 \\w 문자와 \\W 문자(혹은 문자열 시작/끝) 사이의 경계를 나타냅니다.

\`\`\`ts
/\\bcat\\b/.test('the cat sat');   // true  (cat이 독립 단어)
/\\bcat\\b/.test('concatenate');   // false (cat이 단어 안에 포함)
/\\bcat\\b/.test('cat-nap');       // true  (하이픈은 \\W이므로 cat 뒤가 경계)

// 주의: \\b는 유니코드/한글에서는 기대대로 동작하지 않을 수 있음
/\\b한국\\b/.test('한국어');  // false? → 한글은 유니코드, \\b가 적절히 인식 못 할 수 있음
\`\`\`

### ④ \\B — 단어 경계가 아닌 위치

\`\`\`ts
/\\Bcat\\B/.test('concatenate');   // true  (cat이 단어 중간)
/\\Bcat\\B/.test('the cat sat');   // false (cat이 독립 단어)

// \\B 활용: 단어 안에 있는 특정 패턴만 매칭
'broadcast'.match(/\\Bcast\\B/);   // null  ('cast'가 끝부분)
'broadcast'.match(/\\Boad/);       // ['oad'] (단어 안에 위치)
\`\`\`

### ⑤ RegExp 생성자로 동적 패턴 만들기

변수를 패턴에 포함시킬 때는 리터럴 방식 대신 \`new RegExp()\`를 사용합니다.

\`\`\`ts
const word = 'cat';

// ❌ 이렇게 하면 안 됨 — 백슬래시가 문자열로 해석됨
const bad = new RegExp('\\b' + word + '\\b');  // \\b가 그냥 'b'로 해석

// ✅ 올바른 방법 — 백슬래시 이스케이프 필요
const good = new RegExp('\\\\b' + word + '\\\\b', 'g');
// 또는 template literal 활용
const goodAlt = new RegExp(\`\\\\b\${word}\\\\b\`, 'g');
\`\`\`

### ⑥ 개수 세기 패턴

\`\`\`ts
// g 플래그로 모든 매칭을 찾은 후 배열 길이를 세면 됩니다
const regex = new RegExp(\`\\\\b\${word}\\\\b\`, 'gi');  // i 플래그로 대소문자 무시도 가능
const matches = text.match(regex);
return matches ? matches.length : 0;
\`\`\`
    `,
    objectives: [
      '`RegExp` 생성자로 변수 `word`를 포함한 동적 정규식을 생성할 것',
      '`\\\\b` 단어 경계를 적용하여 독립된 단어만 일치하도록 할 것',
      '`g` 플래그를 사용해 모든 일치를 찾고, 결과 배열의 길이를 반환할 것'
    ],
    exercise: `
1. \`countWordOccurrences\` 함수 내부에서 \`new RegExp()\` 생성자를 사용해 \`\\\\b\${word}\\\\b\` 패턴의 정규식을 \`g\` 플래그와 함께 생성하세요.
2. \`text.match(regex)\`를 호출하여 결과를 받고, 결과가 \`null\`이면 \`0\`, 아니면 결과 배열의 \`.length\`를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function countWordOccurrences(text: string, word: string): number {
  // \\b 단어 경계를 활용해 독립된 단어의 등장 횟수를 세세요.
  // new RegExp()로 동적 패턴을 만들어야 합니다.
  return 0;
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
        message: 'new RegExp() 생성자를 사용하여 동적 패턴을 만들어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\\\\b/,
        message: '\\b 단어 경계를 패턴에 포함해야 합니다 (문자열 내에서는 \\\\b로 작성).'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.match(',
        message: 'match() 메서드로 전체 매칭 결과를 배열로 얻어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`new RegExp()` 생성자에서 백슬래시는 두 번 써야 합니다. 예: `new RegExp(\`\\\\\\\\b${word}\\\\\\\\b\`, \'g\')`처럼 `\\\\b`로 작성해야 실제 `\\b`로 인식됩니다.'
    },
    {
      level: 2,
      content: '`text.match(regex)`는 일치하는 모든 결과를 배열로 반환하거나 없으면 `null`을 반환합니다. `(text.match(regex) || []).length`로 안전하게 처리하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function countWordOccurrences(text: string, word: string): number {
  const regex = new RegExp(\`\\\\b\${word}\\\\b\`, 'g');
  return (text.match(regex) || []).length;
}`
    }
  ]
}
