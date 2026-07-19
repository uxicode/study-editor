import type { CurriculumStep } from '@/types/curriculum'

export const week_7_4: CurriculumStep = {
  id: 'week-7-4',
  title: '7주차 · React + TypeScript 컴포넌트 타이핑',
  order: 40,
  category: 'advanced',
  content: {
    mission:
      '상품 카드 컴포넌트(`ProductCard`)와 이에 사용되는 Props 인터페이스를 설계하세요. Props에는 상품 정보인 `product` 객체(타입: `{ id: string; name: string; price: number }`)와 카드 클릭 이벤트 콜백 함수인 `onSelect` (매개변수로 `productId: string`을 받는 함수)를 전달받도록 엄격하게 타이핑하세요.',
    theory: `
      ## React와 TypeScript 연동
      React 컴포넌트에 넘겨지는 \`Props\`의 구조를 선언적으로 명시하면 컴파일 단계에서 전달 오류를 잡아내고 강력한 자동완성 지원을 받을 수 있습니다.

      ## 1. Props 인터페이스 선언 및 사용
      \`\`\`ts
      interface CardProps {
        title: string;
        onClose: () => void;
      }

      export default function Card({ title, onClose }: CardProps) {
        return <div onClick={onClose}>{title}</div>;
      }
      \`\`\`

      ## 2. 함수 타입 정의 방식
      \`onSelect: (id: string) => void\` 와 같이 매개변수의 이름과 타입, 반환 타입을 정의합니다.
    `,
    objectives: [
      'ProductCardProps 인터페이스를 선언하고 product(객체)와 onSelect(함수) 속성을 정의할 것',
      '컴포넌트 인자 구조 분해 시 선언한 ProductCardProps 타입을 명시적으로 어노테이션할 것'
    ],
    exercise: "1. `ItemList.tsx` 컴포넌트에서 아이템을 삭제하는 핸들러 함수를 `useCallback` 훅으로 래핑하세요.\n2. 하위 리스트 컴포넌트들의 불필요한 리렌더링을 막기 위해 의존성 배열에 `setItems` 변경 감지를 명시하세요."
  },
  initialFiles: [
    {
      name: 'ProductCard.tsx',
      path: 'ProductCard.tsx',
      content: `import React from 'react';

// Product 인터페이스와 ProductCardProps 인터페이스를 정의해 보세요.
export interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ProductCard() {
  return (
    <div className="product-card">
      {/* 상품 정보 노출 및 클릭 이벤트 발생 */}
    </div>
  );
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'ProductCard.tsx',
        pattern: 'interface ProductCardProps',
        message: 'ProductCardProps 이름의 Props 인터페이스를 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'ProductCard.tsx',
        pattern: /onSelect\s*:\s*\(/,
        message: 'onSelect 속성을 함수 타입으로 정의해야 합니다.'
      },
      {
        type: 'regex',
        target: 'ProductCard.tsx',
        pattern: /:\s*ProductCardProps/,
        message: 'ProductCard 컴포넌트의 Props 매개변수에 ProductCardProps 타입을 지정해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`interface ProductCardProps { product: Product; onSelect: (productId: string) => void; }` 형태로 정의해 보세요.'
    },
    {
      level: 2,
      content: '컴포넌트 선언부를 `export default function ProductCard({ product, onSelect }: ProductCardProps)` 형태로 작성하여 타이핑을 완성하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React, { useState, useCallback } from 'react';

export default function ItemList() {
  const [items, setItems] = useState<string[]>(['Apple', 'Banana', 'Cherry']);

  const handleDelete = useCallback((itemToRemove: string) => {
    setItems(prevItems => prevItems.filter(item => item !== itemToRemove));
  }, []);

  return (
    <ul>
      {items.map(item => (
        <li key={item}>
          {item}
          <button onClick={() => handleDelete(item)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}`
    }
  ]
}