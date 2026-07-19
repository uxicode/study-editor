import type { CurriculumStep } from '@/types/curriculum'

export const week_6_1: CurriculumStep = {
  id: 'week-6-1',
  title: '6주차 · 정렬 알고리즘 및 커스텀 비교기',
  order: 31,
  category: 'advanced',
  content: {
    mission:
      '상품 리스트 `products`가 주어집니다 (예: `{ name: "Apple", price: 1000, sales: 50 }`). 상품들을 가격(`price`) 오름차순으로 정렬하되, 가격이 같다면 판매량(`sales`) 내림차순으로 정렬하는 `sortProducts(products: Product[]): Product[]` 함수를 작성하세요. Array의 `sort` 메서드와 비교 함수(comparator)를 사용해 구현하세요.',
    theory: `
      배열 정렬은 데이터를 정돈하는 필수 알고리즘입니다. JavaScript의 \`Array.prototype.sort()\` 메서드는 커스텀 비교 함수를 매개변수로 받아 다양한 조건의 정렬을 수행할 수 있습니다.

      ## 1. 비교 함수(Comparator) 구조
      \`\`\`ts
      array.sort((a, b) => {
        if (a가 b보다 앞서야 함) return -1;
        if (b가 a보다 앞서야 함) return 1;
        return 0; // 순서 유지
      });
      \`\`\`
      - 반환값이 **0보다 작으면** \`a\`가 \`b\`보다 앞에 배치됩니다.
      - 반환값이 **0보다 크면** \`b\`가 \`a\`보다 앞에 배치됩니다.
      
      ## 2. 다중 조건 정렬 예시
      \`\`\`ts
      // 가격 오름차순 정렬 예시
      products.sort((a, b) => a.price - b.price);
      \`\`\`
    `,
    objectives: [
      'Array.prototype.sort() 메서드를 사용해 배열을 정렬할 것',
      '가격 비교 후 값이 같을 때 판매량을 비교하여 다중 조건을 만족하는 정렬 함수를 작성할 것'
    ],
    exercise: "1. `sortProducts` 함수 내부에서 Array의 `sort()` 메서드를 사용해 상품 목록을 정렬하세요.\n2. 가격(`price`) 기준 오름차순으로 정렬하되, 가격이 같을 경우 판매량(`sales`) 기준 내림차순으로 정렬하는 다중 정렬 규칙을 구현하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export interface Product {
  name: string;
  price: number;
  sales: number;
}

export function sortProducts(products: Product[]): Product[] {
  // 가격 오름차순, 가격이 같으면 판매량 내림차순 정렬을 리턴하세요.
  return products.sort((a, b) => {
    return 0;
  });
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.sort(',
        message: 'sort() 메서드를 사용하여 정렬해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '비교 함수 내에서 `a.price !== b.price` 라면 `a.price - b.price`를 반환하여 가격 오름차순 정렬을 선행하세요.'
    },
    {
      level: 2,
      content: '가격이 같다면 `b.sales - a.sales`를 반환하여 판매량 내림차순 정렬이 되도록 설정하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export interface Product {
  name: string;
  price: number;
  sales: number;
}

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    return b.sales - a.sales;
  });
}`
    }
  ]
}