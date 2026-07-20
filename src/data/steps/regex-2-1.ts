import type { CurriculumStep } from '@/types/curriculum'

export const regex_2_1: CurriculumStep = {
  id: 'regex-2-1',
  title: '정규식 중급 · 캡처 그룹과 역참조',
  order: 206,
  category: 'advanced',
  content: {
    mission:
      '`YYYY-MM-DD` 형식의 날짜 문자열을 받아 `DD/MM/YYYY` 형식(유럽식)으로 변환하는 `reformatDate(date: string): string` 함수를 작성하세요. 캡처 그룹과 `replace()` 메서드의 역참조(`$1`, `$2`, `$3`)를 반드시 활용하세요.',
    theory: `
## 캡처 그룹(Capture Group) — ()

괄호 \`()\`로 감싼 부분은 **캡처 그룹**이 됩니다.
캡처 그룹은 매칭된 부분 문자열을 저장해두고 나중에 재사용할 수 있습니다.

### ① 기본 캡처 그룹

\`\`\`ts
const regex = /(\\d{4})-(\\d{2})-(\\d{2})/;
const result = '2024-07-20'.match(regex);

// result[0]: 전체 매칭 문자열 '2024-07-20'
// result[1]: 첫 번째 캡처 그룹 '2024' (연도)
// result[2]: 두 번째 캡처 그룹 '07'   (월)
// result[3]: 세 번째 캡처 그룹 '20'   (일)
console.log(result?.[1]);  // '2024'
\`\`\`

### ② replace()에서 $N 역참조

\`replace()\`의 두 번째 인수에서 \`$1\`, \`$2\`, \`$3\` 등으로 캡처 그룹의 값을 참조합니다.

\`\`\`ts
// YYYY-MM-DD → MM/DD/YYYY (미국식)
'2024-07-20'.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, '$2/$3/$1');
// '07/20/2024'

// YYYY-MM-DD → DD.MM.YYYY (독일식)
'2024-07-20'.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, '$3.$2.$1');
// '20.07.2024'

// 이름 순서 바꾸기: "Last, First" → "First Last"
'Smith, John'.replace(/(\\w+),\\s*(\\w+)/, '$2 $1');
// 'John Smith'
\`\`\`

### ③ 전화번호 포맷팅 (캡처 그룹 활용)

\`\`\`ts
// 숫자만 있는 번호 → 하이픈 포맷
'01012345678'.replace(/^(010)(\\d{4})(\\d{4})$/, '$1-$2-$3');
// '010-1234-5678'

// 다양한 입력 정규화: 이미 포맷된 것은 변경 없음
'010-9876-5432'.replace(/^(010)-?(\\d{4})-?(\\d{4})$/, '$1-$2-$3');
// '010-9876-5432'
\`\`\`

### ④ exec()로 반복 캡처

\`g\` 플래그와 \`exec()\`를 함께 쓰면 매칭을 하나씩 순회합니다.

\`\`\`ts
const regex = /(\\d{4})-(\\d{2})-(\\d{2})/g;
const dates = '출발: 2024-07-20, 도착: 2024-08-15';
let match;
while ((match = regex.exec(dates)) !== null) {
  console.log(\`연도: \${match[1]}, 월: \${match[2]}, 일: \${match[3]}\`);
}
// 연도: 2024, 월: 07, 일: 20
// 연도: 2024, 월: 08, 일: 15
\`\`\`

### ⑤ 역참조 \\ N — 패턴 안에서 재사용

정규식 **패턴 안에서** 이전 캡처 그룹의 값을 재참조합니다. (\`$N\`은 치환 문자열 안에서만 사용)

\`\`\`ts
// 같은 단어가 연속으로 반복되는 경우 탐지
/\\b(\\w+)\\s+\\1\\b/.test('the the quick fox');  // true  ('the'가 두 번)
/\\b(\\w+)\\s+\\1\\b/.test('the quick fox');       // false

// HTML 여는 태그와 닫는 태그 쌍 맞추기
/<(\\w+)>[^<]*<\\/\\1>/.test('<b>bold</b>');    // true
/<(\\w+)>[^<]*<\\/\\1>/.test('<b>bold</i>');    // false (태그 불일치)
\`\`\`

### ⑥ 함수 치환 — 동적 변환

replace()의 두 번째 인수로 **함수**를 넘기면 매칭 결과를 동적으로 처리합니다.

\`\`\`ts
// camelCase → snake_case 변환
'helloWorldFoo'.replace(/([A-Z])/g, (_match, letter) => \`_\${letter.toLowerCase()}\`);
// 'hello_world_foo'

// 금액 숫자에 천 단위 콤마 삽입
'1234567'.replace(/(\\d)(?=(\\d{3})+$)/g, '$1,');
// '1,234,567'
\`\`\`
    `,
    objectives: [
      '`(\\\\d{4})`, `(\\\\d{2})`, `(\\\\d{2})` 세 캡처 그룹으로 날짜의 연/월/일을 분리할 것',
      '`replace()`의 치환 문자열에서 `$3/$2/$1` 순서로 역참조하여 날짜 형식을 변환할 것'
    ],
    exercise: `
1. \`reformatDate\` 함수 내부에서 \`YYYY-MM-DD\` 패턴을 세 개의 캡처 그룹으로 나누는 정규식을 선언하세요.
   - 그룹 1: 연도 (4자리), 그룹 2: 월 (2자리), 그룹 3: 일 (2자리)
2. \`date.replace(regex, '$3/$2/$1')\`을 사용하여 일/월/연도 순서로 재조합하여 반환하세요.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function reformatDate(date: string): string {
  // 예: '2024-07-20' → '20/07/2024'
  // 캡처 그룹(그룹1=연도, 그룹2=월, 그룹3=일)과 $3/$2/$1 역참조를 활용하세요.
  return date;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.replace(',
        message: 'replace() 메서드를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\$[123]/,
        message: '$1, $2, $3 등의 역참조를 치환 문자열에 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\\d\{[24]\}\)/,
        message: '괄호()로 캡처 그룹을 지정해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '날짜 패턴을 세 그룹으로 나눠 보세요: `/(\\d{4})-(\\d{2})-(\\d{2})/`. 괄호가 각 그룹을 나타냅니다.'
    },
    {
      level: 2,
      content: '`replace(regex, \'$3/$2/$1\')`에서 `$3`은 세 번째 캡처 그룹(일), `$2`는 월, `$1`은 연도를 나타냅니다. 역참조 순서만 바꾸면 원하는 포맷으로 변환됩니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function reformatDate(date: string): string {
  return date.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, '$3/$2/$1');
}`
    }
  ]
}
