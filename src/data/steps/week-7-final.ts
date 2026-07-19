import type { CurriculumStep } from '@/types/curriculum'

export const week_7_final: CurriculumStep = {
  id: 'week-7-final',
  title: '7주차 종합 · Next.js 대시보드 컴포넌트 설계 (App Router)',
  order: 42,
  category: 'advanced',
  content: {
    mission:
      '서버에서 로드한 초기 유저 목록 데이터(`initialUsers`)를 가져와 필터링하고 추가할 수 있는 클라이언트 상태 대시보드 컴포넌트(`Dashboard.tsx`)를 작성하세요.\n- 파일 최상단에 클라이언트 인터랙션을 가능케 하는 적절한 지시어를 작성하세요.\n- `useState`를 사용하여 현재 유저 리스트(`users`)와 새 유저 이름 입력을 위한 인풋 상태(`newName`)를 선언하세요.\n- 유저를 추가하는 이벤트 핸들러 `handleAddUser`를 `useCallback`으로 메모이제이션 하세요.',
    theory: `
      ## 7주차 종합: Next.js 대시보드 뷰 통합 설계

      RSC와 클라이언트 컴포넌트 간의 데이터 전달 경계를 이해하고, 클라이언트 컴포넌트 내부에서 Hooks를 사용해 상태 변경에 최적화된 화면을 구성해 봅니다.

      ### 1. 지시어 선언
      상태 및 인터랙션이 발생하므로 반드시 최상단에 \`"use client"\`를 명시해야 런타임 오류가 없습니다.

      ### 2. 메모이제이션
      함수가 하위 렌더링 때마다 재생성되지 않도록 \`useCallback\`을 적용하여 렌더링 성능 누수를 최적화합니다.
    `,
    objectives: [
      '"use client" 지시어를 최상단에 삽입할 것',
      'useState를 사용해 users 및 newName 상태를 관리할 것',
      'useCallback을 사용해 handleAddUser 함수를 메모이제이션 처리할 것'
    ],
    exercise: "1. 창의 너비를 실시간 감지하는 커스텀 훅 `useWindowSize.ts`를 구현하세요.\n2. 브라우저 resize 이벤트가 발생할 때마다 상태를 업데이트하고, 이벤트를 클린업하도록 작성하세요."
  },
  initialFiles: [
    {
      name: 'Dashboard.tsx',
      path: 'components/Dashboard.tsx',
      content: `import React, { useState, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
}

interface DashboardProps {
  initialUsers: User[];
}

export default function Dashboard({ initialUsers }: DashboardProps) {
  // 상태 변수 선언 및 유저 추가 기능 구현
  
  return (
    <div className="dashboard">
      <input type="text" placeholder="New user name..." />
      <button>Add User</button>
      <ul>
        {initialUsers.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
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
        target: 'components/Dashboard.tsx',
        pattern: 'use client',
        message: '클라이언트 컴포넌트로 선언하기 위한 "use client" 지시어가 필요합니다.'
      },
      {
        type: 'includes',
        target: 'components/Dashboard.tsx',
        pattern: 'useCallback(',
        message: '유저 추가 핸들러 함수를 useCallback으로 메모이제이션 해야 합니다.'
      },
      {
        type: 'regex',
        target: 'components/Dashboard.tsx',
        pattern: /useState\(\s*initialUsers\s*\)/,
        message: 'initialUsers를 초기값으로 하는 useState 상태를 선언해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`const [users, setUsers] = useState(initialUsers);` 로 초기값을 주입하세요.'
    },
    {
      level: 2,
      content: '유저 추가는 `const handleAddUser = useCallback(() => { setUsers(prev => [...prev, { id: Date.now().toString(), name: newName }]); setNewName(""); }, [newName]);`와 유사한 형식으로 작성할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}`
    }
  ]
}