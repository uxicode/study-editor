import type { CurriculumStep } from '@/types/curriculum'

export const week_7_3: CurriculumStep = {
  id: 'week-7-3',
  title: '7주차 · React Hooks 고급 (useRef, useReducer, Custom Hook)',
  order: 39,
  category: 'advanced',
  content: {
    mission:
      '인풋 포커싱 제어를 처리하는 컴포넌트를 작성하세요.\n1. `useRef`를 사용하여 입력창(input DOM) 엘리먼트에 포커스를 줄 수 있도록 레퍼런스를 바인딩하세요.\n2. 마운트 시점에 자동으로 입력창에 포커스를 주도록 `useEffect`와 생성한 ref를 활용해 동작하게 만드세요.\n3. 상태 제어를 위한 커스텀 훅 `useToggle`을 작성하여, 입력창 표시 여부(boolean) 상태를 껏다 켤 수 있도록 로직을 분리하세요.',
    theory: `
      ## 1. useRef
      렌더링을 유발하지 않으면서도 보존할 값을 담거나, **DOM 노드에 직접 접근**해야 할 때 사용합니다.
      \`\`\`ts
      const inputRef = useRef<HTMLInputElement>(null);
      // DOM 연결 후
      inputRef.current?.focus();
      \`\`\`

      ## 2. Custom Hooks (커스텀 훅)
      여러 컴포넌트에서 자주 반복되는 상태 관리나 생명주기 로직을 하나로 묶어 공유하기 위해 작성하는 JS 함수입니다. 이름이 항상 \`use\`로 시작해야 한다는 컨벤션이 있습니다.
      \`\`\`ts
      function useToggle(initialValue = false) {
        const [value, setValue] = useState(initialValue);
        const toggle = () => setValue(v => !v);
        return [value, toggle] as const;
      }
      \`\`\`
    `,
    objectives: [
      'useRef를 사용하여 input 엘리먼트 레퍼런스를 지정할 것',
      'useEffect를 사용해 첫 마운트 완료 시점에 inputRef.current.focus()를 호출할 것',
      '상태 제어를 돕는 useToggle 커스텀 훅을 만들어 컴포넌트에 적용할 것'
    ],
    exercise: "1. `FocusManager.tsx`에서 `useRef`를 지정하여 `input` 요소의 레퍼런스를 참조하세요.\n2. 마운트 시 `useEffect`를 사용해 `inputRef.current?.focus()`를 호출하고, `useToggle` 커스텀 훅을 구현해 인풋 표시 여부를 토글하도록 구성하세요."
  },
  initialFiles: [
    {
      name: 'FocusManager.tsx',
      path: 'FocusManager.tsx',
      content: `"use client";
import React, { useState, useEffect, useRef } from 'react';

// 1. 여기에 useToggle 커스텀 훅을 구현하세요.
// function useToggle(initialValue: boolean) { ... }

export default function FocusManager() {
  // 2. inputRef를 선언하여 input 엘리먼트에 연결하고 자동 포커싱을 구현하세요.
  
  return (
    <div>
      <input type="text" />
      <button>Toggle Input Display</button>
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
        target: 'FocusManager.tsx',
        pattern: 'useRef<',
        message: 'useRef 훅을 타입 지정과 함께 정의해야 합니다.'
      },
      {
        type: 'includes',
        target: 'FocusManager.tsx',
        pattern: '.focus(',
        message: '마운트 후 focus() 메서드를 작동시켜야 합니다.'
      },
      {
        type: 'includes',
        target: 'FocusManager.tsx',
        pattern: 'useToggle',
        message: 'useToggle 이름의 커스텀 훅을 분리 정의해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: 'useToggle은 `const [state, setState] = useState(initial); const toggle = () => setState(prev => !prev); return [state, toggle] as const;` 로 선언할 수 있습니다.'
    },
    {
      level: 2,
      content: '마운트 직후 한 번만 작동하게 하려면 useEffect의 두 번째 인자인 의존성 배열에 빈 배열 `[]`을 부여하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React, { useState, useEffect, useRef } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle] as const;
}

export default function FocusManager() {
  const [isInputVisible, toggleInput] = useToggle(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInputVisible) {
      inputRef.current?.focus();
    }
  }, [isInputVisible]);

  return (
    <div>
      {isInputVisible && <input ref={inputRef} type="text" placeholder="Focus me!" />}
      <button onClick={toggleInput}>Toggle Input Display</button>
    </div>
  );
}`
    }
  ]
}