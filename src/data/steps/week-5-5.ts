import type { CurriculumStep } from '@/types/curriculum'

export const week_5_5: CurriculumStep = {
  id: 'week-5-5',
  title: '5주차 · Object 조작 및 엔트리 변환 (keys, values, entries)',
  order: 29,
  category: 'advanced',
  content: {
    mission:
      '상품별 재고 수량 정보를 담은 객체 `inventory`가 매개변수로 주어집니다 (예: `{ apple: 10, banana: 0, orange: 5 }`). 이 객체를 활용하여 재고가 0개보다 큰 품목 이름과 수량의 쌍을 담은 새로운 객체(품절 품목이 제외된 객체)를 반환하는 `filterAvailableStock(inventory: Record<string, number>): Record<string, number>` 함수를 작성하세요. `Object.entries()`와 `Object.fromEntries()`를 적극 활용하세요.',
    theory: `
      객체(Object)는 Key-Value 구조로 데이터를 저장하는 기본 구조입니다. JavaScript에서는 객체를 배열로 풀어서 고차 함수를 적용한 후 다시 객체로 조립하는 유용한 헬퍼 메서드들을 제공합니다.

      ## 1. Object.keys(), Object.values()
      객체의 key들 혹은 value들만 추출해 순회 가능한 **배열**로 반환합니다.
      \`\`\`ts
      const info = { name: 'Kim', age: 20 };
      Object.keys(info); // ['name', 'age']
      Object.values(info); // ['Kim', 20]
      \`\`\`

      ## 2. Object.entries()
      객체의 자체 상속 가능 속성 \`[key, value]\` 쌍의 배열을 반환합니다.
      \`\`\`ts
      Object.entries(info); // [['name', 'Kim'], ['age', 20]]
      \`\`\`

      ## 3. Object.fromEntries()
      \`[key, value]\` 쌍의 리스트를 받아 객체로 다시 조립합니다.
      \`\`\`ts
      const pairs = [['a', 1], ['b', 2]];
      Object.fromEntries(pairs); // { a: 1, b: 2 }
      \`\`\`
    `,
    objectives: [
      'Object.entries()를 통해 객체를 키-값 쌍의 배열로 변환할 것',
      '배열의 filter() 고차 함수를 이용해 값이 0보다 큰 것들만 남겨둘 것',
      'Object.fromEntries()를 사용하여 필터링된 배열을 다시 객체 형태로 복원해 반환할 것'
    ],
    exercise: "1. `aggregateGroupSales` 함수 내부에서 `reduce()` 메서드를 사용해 그룹별 매출을 누적하세요.\n2. 누적 결과 객체인 `Record<string, number>`를 최종 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function filterAvailableStock(inventory: Record<string, number>): Record<string, number> {
  // 재고가 0보다 큰 품목만 남긴 새로운 객체를 반환하세요.
  const entries = Object.entries(inventory);
  return {};
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'Object.entries(',
        message: 'Object.entries() 메서드를 사용해 배열로 변환해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'Object.fromEntries(',
        message: 'Object.fromEntries() 메서드를 사용해 다시 객체로 변환해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`Object.entries(inventory)`로 얻은 엔트리 배열에서 `filter(([key, value]) => value > 0)` 형태로 필터링하세요.'
    },
    {
      level: 2,
      content: '필터링된 결과 배열을 `Object.fromEntries(filteredEntries)`의 인자로 넣어 객체로 변환하여 return 하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function aggregateGroupSales(sales: any[]): Record<string, number> {
  return sales.reduce((acc, curr) => {
    acc[curr.group] = (acc[curr.group] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
}`
    }
  ]
}