import type { CurriculumStep } from '@/types/curriculum'

export const week_5_4: CurriculumStep = {
  id: 'week-5-4',
  title: '5주차 · Array 탐색 및 조건 매칭 (find, some, every)',
  order: 28,
  category: 'advanced',
  content: {
    mission:
      '장바구니 상품 목록(`items`)이 주어질 때, 다음 세 가지 규칙을 충족하는 검사 함수들을 각각 구현하세요:\n1. 품절된 상품(`isOutOfStock: true`)이 하나라도 존재하는지 확인하는 `hasOutOfStockItem` 함수\n2. 모든 상품이 무료 배송(`isFreeShipping: true`)을 지원하는지 확인하는 `areAllFreeShipping` 함수\n3. 특정 ID를 갖는 상품 객체를 찾아서 반환하는 `findItemById` 함수',
    theory: `
      데이터를 탐색하거나 특정 정합성 기준을 만족하는지 배열 전체를 훑어야 할 때, 조건 탐색 메서드들을 사용하면 가독성 높고 최적화된 코드를 작성할 수 있습니다.

      ## 1. Array.prototype.find()
      판별 함수를 만족하는 첫 번째 요소의 **값**을 반환합니다. 만족하는 요소가 없으면 \`undefined\`를 반환합니다.
      \`\`\`ts
      const found = [5, 12, 8, 130].find(element => element > 10); // 12
      \`\`\`

      ## 2. Array.prototype.some()
      배열 안의 어떤 요소라도 주어진 판별 함수를 통과하는지 테스트합니다. **하나라도 통과하면 true**를 반환합니다. (만나면 즉시 조기 중단)
      \`\`\`ts
      const hasOdd = [2, 4, 6, 7].some(x => x % 2 !== 0); // true
      \`\`\`

      ## 3. Array.prototype.every()
      배열의 **모든 요소**가 주어진 판별 함수를 통과하는지 테스트합니다.
      \`\`\`ts
      const allEven = [2, 4, 6].every(x => x % 2 === 0); // true
      \`\`\`
    `,
    objectives: [
      'some() 메서드를 사용해 품절 상품 존재 여부를 판단하는 hasOutOfStockItem을 작성할 것',
      'every() 메서드를 사용해 모든 상품의 무료배송 여부를 판단하는 areAllFreeShipping을 작성할 것',
      'find() 메서드를 사용해 특정 상품을 탐색하는 findItemById를 작성할 것'
    ],
    exercise: "1. `processActiveUsers` 함수 내부에서 `filter()` 메서드를 사용하여 `user.active`가 true인 유저만 필터링하세요.\n2. `map()` 메서드를 사용해 각 유저 객체를 `{ id, email }` 구조만 남도록 가공하여 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface CartItem {
  id: string;
  name: string;
  price: number;
  isOutOfStock: boolean;
  isFreeShipping: boolean;
}

export function hasOutOfStockItem(items: CartItem[]): boolean {
  // 품절 상품이 1개라도 있는지 검사하세요.
  return false;
}

export function areAllFreeShipping(items: CartItem[]): boolean {
  // 모든 상품이 무료배송인지 검사하세요.
  return false;
}

export function findItemById(items: CartItem[], id: string): CartItem | undefined {
  // id가 일치하는 상품을 찾아 리턴하세요.
  return undefined;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.some(',
        message: 'some() 메서드를 사용하여 품절 상품을 감지해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.every(',
        message: 'every() 메서드를 사용하여 무료 배송 상품 여부를 감지해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.find(',
        message: 'find() 메서드를 사용하여 아이디 매칭 탐색을 수행해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '각 함수의 리턴문에 `items.some(item => item.isOutOfStock)`, `items.every(item => item.isFreeShipping)`, `items.find(item => item.id === id)` 형태로 식을 바로 연결해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function processActiveUsers(users: any[]): any[] {
  return users
    .filter(user => user.active)
    .map(user => ({ id: user.id, email: user.email }));
}`
    }
  ]
}