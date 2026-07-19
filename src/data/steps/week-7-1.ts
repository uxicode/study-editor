import type { CurriculumStep } from '@/types/curriculum'

export const week_7_1: CurriculumStep = {
  id: 'week-7-1',
  title: '7주차 · React Server Components (RSC) 와 Client Components',
  order: 37,
  category: 'advanced',
  content: {
    mission:
      '사용자가 클릭할 때마다 조회수가 증가하는 인터랙티브 버튼 컴포넌트(`CounterButton`)를 작성하세요. 단, Next.js의 클라이언트 컴포넌트로 지정하기 위해 파일 맨 위에 적절한 지시어를 선언하세요.',
    theory: `
      ## 1. React Server Components (RSC)
      Next.js App Router는 기본적으로 모든 컴포넌트를 **React Server Components (서버 컴포넌트)**로 간주합니다. 서버 컴포넌트는 서버에서 실행되어 HTML로 렌더링되며 클라이언트로 전송되는 JS 번들 용량을 감소시킵니다.
      - **특징**: \`useState\`, \`useEffect\` 등의 브라우저 훅이나 이벤트 리스너(클릭, 변경 등)를 사용할 수 없습니다.

      ## 2. Client Components (클라이언트 컴포넌트)
      브라우저에서의 상호작용(인터랙션)이 필요하거나 브라우저 API를 사용해야 할 때 지정합니다.
      - **설정 방법**: 파일 최상단에 \`"use client"\` (또는 \`\'use client\'\`) 지시어를 선언해야 합니다.
    `,
    objectives: [
      '파일 최상단에 "use client" 지시어를 추가할 것',
      'useState 훅을 이용하여 count 상태값을 선언하고 버튼 클릭 시 1씩 증가시키도록 구성할 것'
    ],
    exercise: "1. `CounterButton.tsx` 파일의 최상단에 클라이언트 지시어 `\"use client\"`를 추가하세요.\n2. `useState` 훅을 사용해 count 값을 증가시키는 버튼 상호작용 컴포넌트를 구현하세요."
  },
  initialFiles: [
    {
      name: 'CounterButton.tsx',
      path: 'CounterButton.tsx',
      content: `import React, { useState } from 'react';

export default function CounterButton() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'CounterButton.tsx',
        pattern: 'use client',
        message: '클라이언트 컴포넌트로 지정하기 위해 파일 최상단에 "use client" 지시어를 작성해야 합니다.'
      },
      {
        type: 'includes',
        target: 'CounterButton.tsx',
        pattern: 'useState(',
        message: 'useState 훅을 사용하여 상태를 선언해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '코드의 1번 라인에 `"use client";`를 명시적으로 삽입하고 코드를 제출해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React, { useState } from 'react';

export default function CounterButton() {
  const [count, setCount] = useState(0);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`
    }
  ]
}