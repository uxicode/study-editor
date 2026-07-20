import type { CurriculumStep } from '@/types/curriculum'

export const regex_3_4: CurriculumStep = {
  id: 'regex-3-4',
  title: '정규식 고급 · CSV 파서 (따옴표 처리)',
  order: 215,
  category: 'advanced',
  content: {
    mission:
      'CSV 형식의 한 줄을 파싱하여 각 필드 값의 배열을 반환하는 `parseCsvLine(line: string): string[]` 함수를 작성하세요. 따옴표(`"`)로 감싸진 필드는 내부에 쉼표와 줄바꿈을 포함할 수 있으며, 이스케이프된 따옴표(`""`)는 리터럴 따옴표(`"`)로 처리해야 합니다.\n\n예: `\'John,"Smith, Jr.",30,"Say \\"hello\\""\' → [\'John\', \'Smith, Jr.\', \'30\', \'Say "hello"\']`',
    theory: `
## 복잡한 패턴: CSV 파서와 탐욕/비탐욕 조합

CSV 파싱은 정규식의 대표적인 어려운 문제입니다.
따옴표로 감싸진 필드 안에 쉼표가 있을 수 있기 때문입니다.

### ① 단순 CSV (따옴표 없음)

\`\`\`ts
// 쉼표로 단순 분리
'John,Doe,30'.split(',');  // ['John', 'Doe', '30']
\`\`\`

### ② 따옴표 안의 쉼표 — 문제 발생

\`\`\`ts
// "Smith, Jr." 처럼 따옴표 안에 쉼표가 있으면 split(',') 은 틀림
'"Smith, Jr.",30'.split(',');  // ['"Smith', ' Jr."', '30']  ← 잘못됨
\`\`\`

### ③ CSV 필드 패턴 설계

두 종류의 필드를 교대로 처리합니다:
- 따옴표 필드: \`"[^"]*"\` 또는 이스케이프 처리 버전
- 일반 필드: \`[^,]+\`

\`\`\`ts
// 기본 CSV 필드 패턴 (이스케이프 미처리)
const fieldRegex = /"([^"]*)"|([^,]+)|(?<=,)(?=,|$)/g;
//                 ^────────  ^──────  ^──────────────
//                 따옴표 필드 일반 필드 빈 필드

// 주의: "" 이스케이프를 처리하려면 패턴을 확장해야 함
// "(?:[^"]|"")*"  → 따옴표 안에서 "" (이스케이프된 따옴표) 허용
const quotedField = /"((?:[^"]|"")*)"/;
\`\`\`

### ④ 이스케이프된 따옴표 처리

\`\`\`ts
// "" → " 로 변환
const raw = '"Say ""hello"""';  // 원시 CSV 값
const match = raw.match(/"((?:[^"]|"")*)"/);
const value = match?.[1].replace(/""/g, '"');
// 'Say "hello"'
\`\`\`

### ⑤ matchAll()로 모든 필드 추출

\`\`\`ts
const csvLine = 'John,"Smith, Jr.",30,"Say ""hello"""';
const fieldPattern = /("(?:[^"]|"")*"|[^,]*)/g;

const fields = [...csvLine.matchAll(fieldPattern)]
  .map(m => m[1])          // 전체 매칭 (따옴표 포함)
  .filter((_, i) => i % 2 === 0)  // 쉼표 구분자 제거 (홀수 인덱스)
  .map(f => {
    if (f.startsWith('"')) {
      return f.slice(1, -1).replace(/""/g, '"');  // 따옴표 제거 + 이스케이프 복원
    }
    return f;
  });
\`\`\`

### ⑥ 대안: 상태 기반 파서 + 정규식 조합

\`\`\`ts
// 복잡한 CSV는 정규식만으로 한계 — 상태 기계와 조합 권장
function parseCsvRobust(line: string): string[] {
  const results: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'; i++;  // "" → " 이스케이프
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      results.push(current); current = '';
    } else {
      current += char;
    }
  }
  results.push(current);
  return results;
}
\`\`\`
    `,
    objectives: [
      '따옴표로 감싸진 필드를 `"(?:[^"]|"")*"` 패턴으로 올바르게 추출할 것',
      '추출한 필드에서 앞뒤 따옴표를 제거하고 `""` 이스케이프를 `"`로 복원할 것',
      '따옴표 없는 일반 필드도 올바르게 처리할 것'
    ],
    exercise: `
1. \`parseCsvLine\` 함수에서 CSV 필드를 추출하는 정규식을 작성하세요.
   - 따옴표 필드: \`"(?:[^"]|"")*"\`
   - 일반 필드: \`[^,]*\`
2. \`matchAll()\`로 모든 필드를 추출하고, 따옴표 필드는 앞뒤 따옴표를 제거한 후 \`""\`를 \`"\`로 변환하세요.
3. 빈 문자열도 유효한 필드로 처리해야 합니다.
    `.trim()
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function parseCsvLine(line: string): string[] {
  // 따옴표로 감싸진 필드와 일반 필드를 모두 처리하는 정규식
  // 따옴표 필드: "(?:[^"]|"")*"  (내부 쉼표 + "" 이스케이프 허용)
  // 일반 필드: [^,]*
  const fieldRegex = /("(?:[^"]|"")*"|[^,]*)/g;
  const results: string[] = [];

  // matchAll로 모든 필드를 추출하고, 쉼표 구분자 항목을 건너뜁니다.
  let isComma = false;
  for (const match of line.matchAll(fieldRegex)) {
    if (isComma) { isComma = false; continue; }
    isComma = true;
    
    const raw = match[1];
    // 따옴표 필드 처리
    if (raw.startsWith('"') && raw.endsWith('"')) {
      results.push(raw.slice(1, -1).replace(/""/g, '"'));
    } else {
      results.push(raw);
    }
  }

  return results;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\(\?:\[^"\]|""\)/,
        message: '따옴표 안의 "" 이스케이프를 처리하는 (?:[^"]|"") 패턴이 필요합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.replace(/""/g',
        message: '"" 이스케이프를 " 로 복원하는 replace 처리가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.matchAll(',
        message: 'matchAll()을 사용하여 모든 필드를 순회해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '따옴표 필드 패턴 `"(?:[^"]|"")*"`를 분해해보면: `"` 시작, `(?:[^"]|"")` 따옴표가 아니거나 연속된 따옴표(`""`)가 0번 이상, `"` 끝으로 구성됩니다.'
    },
    {
      level: 2,
      content: '`matchAll` 결과에는 전체 필드 매칭과 쉼표 사이의 빈 문자열 매칭이 번갈아 나옵니다. `isComma` 플래그로 홀수 번째 매칭(쉼표 자리)을 건너뛰는 로직을 사용하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다. 초기 코드가 이미 올바른 구조를 갖추고 있으니, matchAll 루프와 따옴표 처리 로직을 완성하세요.',
      codeSnippet: `export function parseCsvLine(line: string): string[] {
  const fieldRegex = /("(?:[^"]|"")*"|[^,]*)/g;
  const results: string[] = [];
  let isComma = false;
  for (const match of line.matchAll(fieldRegex)) {
    if (isComma) { isComma = false; continue; }
    isComma = true;
    const raw = match[1];
    if (raw.startsWith('"') && raw.endsWith('"')) {
      results.push(raw.slice(1, -1).replace(/""/g, '"'));
    } else {
      results.push(raw);
    }
  }
  return results;
}`
    }
  ]
}
