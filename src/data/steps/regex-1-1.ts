import type { CurriculumStep } from '@/types/curriculum'

export const regex_1_1: CurriculumStep = {
  id: 'regex-1-1',
  title: '정규식 기초 · 메타문자와 특수 기호',
  order: 200,
  category: 'advanced',
  content: {
    mission:
      '문자열에서 숫자, 알파벳, 공백을 각각 탐지하는 세 가지 패턴을 활용하여 `classifyCharacters(input: string): { digits: number; letters: number; spaces: number }` 함수를 작성하세요. `\\d`, `\\w`, `\\s` 등의 메타문자와 `match()` 메서드를 사용해 각 문자 종류의 개수를 카운팅하세요.',
    theory: `
## 정규 표현식(Regular Expression)이란?

정규 표현식은 문자열에서 특정 **패턴**을 찾거나 치환하기 위한 미니 언어입니다.
JavaScript/TypeScript에서는 두 가지 방법으로 정규식을 선언합니다:

\`\`\`ts
// 1. 리터럴 방식 (권장 — 패턴이 고정일 때)
const regex = /hello/;

// 2. 생성자 방식 (동적으로 패턴을 만들어야 할 때)
const pattern = 'hello';
const regex2 = new RegExp(pattern);
\`\`\`

---

## 핵심 메타문자 5가지

### ① \\d — 숫자 하나 ([0-9]와 동일)

\`\`\`ts
const hasDigit = /\\d/.test('abc3');   // true  → '3'이 숫자이므로
const noDigit  = /\\d/.test('abc');    // false → 숫자 없음

// 전체 매칭 결과 추출
'a1b2c3'.match(/\\d/g);  // ['1', '2', '3']
\`\`\`

### ② \\D — 숫자가 아닌 문자 ([^0-9]와 동일)

\`\`\`ts
'a1b2'.match(/\\D/g);   // ['a', 'b']
'123'.match(/\\D/g);    // null (숫자만 존재)
\`\`\`

### ③ \\w — 단어 문자 ([a-zA-Z0-9_]와 동일)

\`\`\`ts
'hello_world 123!'.match(/\\w/g);
// ['h','e','l','l','o','_','w','o','r','l','d','1','2','3']
// 공백(space)과 느낌표(!)는 \\w에 해당하지 않음

/\\w+/.test('abc123');   // true  → 한 글자 이상의 단어 문자 존재
/\\w+/.test('!@#');      // false → 단어 문자 없음
\`\`\`

### ④ \\s — 공백 문자 (스페이스, 탭, 줄바꿈 등)

\`\`\`ts
'hello world'.match(/\\s/g);   // [' ']
'a\\tb\\nc'.match(/\\s/g);      // ['\\t', '\\n']   탭과 줄바꿈도 포함

// 공백 제거 예시
'  hello  world  '.replace(/\\s/g, '');  // 'helloworld'
\`\`\`

### ⑤ . — 임의의 문자 하나 (줄바꿈 제외)

\`\`\`ts
/./.test('a');    // true
/./.test('\\n');  // false (줄바꿈은 제외)
/./.test(' ');   // true  (공백은 포함)

// 주의: 리터럴 점(.)은 \\. 으로 이스케이프
/\\./.test('3.14');  // true  (실제 점)
/\\./.test('314');   // false (점 없음)
\`\`\`

---

## 대/소문자 반전 패턴

| 패턴  | 의미               | 반전 패턴 | 의미                 |
|-------|--------------------|-----------|----------------------|
| \\d   | 숫자               | \\D       | 숫자 외의 문자       |
| \\w   | 단어 문자          | \\W       | 단어 문자 외         |
| \\s   | 공백               | \\S       | 공백 외              |

\`\`\`ts
// 단어 문자가 아닌 것 모두 제거
'hello, world! 123'.replace(/\\W/g, '');  // 'helloworld123'

// 공백이 아닌 단어들을 배열로 추출
'foo  bar   baz'.match(/\\S+/g);  // ['foo', 'bar', 'baz']
\`\`\`
    `,
    objectives: [
      '`\\d` 메타문자와 `match()` + `g` 플래그를 이용해 숫자의 개수를 카운팅할 것',
      '`/[a-zA-Z]/g` 또는 `\\w` 계열을 이용해 알파벳 문자의 개수를 카운팅할 것',
      '`\\s` 메타문자로 공백 문자의 개수를 카운팅할 것'
    ],
    exercise: `
1. \`classifyCharacters\` 함수 내부에서 각각 숫자, 알파벳, 공백을 매칭하는 정규식 3개를 선언하세요.
2. 각 정규식으로 \`input.match(regex)\`를 호출하고 결과 배열의 길이를 카운트하세요.
   - 매칭 결과가 \`null\`일 경우 0으로 처리해야 합니다.
3. \`{ digits, letters, spaces }\` 객체를 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function classifyCharacters(input: string): {
  digits: number;
  letters: number;
  spaces: number;
} {
  // 숫자, 알파벳, 공백 각각을 카운팅하세요.
  const digits = 0;
  const letters = 0;
  const spaces = 0;
  return { digits, letters, spaces };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\\\\d/,
        message: '\\d 메타문자를 사용하여 숫자를 탐지해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\\\\s/,
        message: '\\s 메타문자를 사용하여 공백을 탐지해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.match(',
        message: 'match() 메서드를 사용하여 매칭 결과를 추출해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`input.match(/\\\\d/g)`는 input에서 숫자에 해당하는 모든 문자를 배열로 반환합니다. 매칭 결과가 없으면 `null`을 반환하므로 `|| []`로 안전하게 처리하세요.'
    },
    {
      level: 2,
      content: '알파벳만 카운팅할 때는 `/[a-zA-Z]/g`를 사용하세요. `\\w`는 숫자와 언더바도 포함하므로 순수 알파벳만 원하면 문자 클래스를 명시하는 것이 더 정확합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function classifyCharacters(input: string): {
  digits: number;
  letters: number;
  spaces: number;
} {
  const digits  = (input.match(/\\d/g)      || []).length;
  const letters = (input.match(/[a-zA-Z]/g) || []).length;
  const spaces  = (input.match(/\\s/g)      || []).length;
  return { digits, letters, spaces };
}`
    }
  ]
}
