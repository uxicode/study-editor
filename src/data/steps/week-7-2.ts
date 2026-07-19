import type { CurriculumStep } from '@/types/curriculum'

export const week_7_2: CurriculumStep = {
  id: 'week-7-2',
  title: '7주차 · React Hooks 기초 (useState, useEffect, useMemo, useCallback)',
  order: 38,
  category: 'advanced',
  content: {
    mission:
      '인자값으로 리스트 필터링 검색어를 받는 검색창 컴포넌트(`SearchContainer`)를 작성하세요.\n1. `useState`를 사용해 검색 키워드(`searchQuery`) 상태를 관리하세요.\n2. `useMemo`를 사용해 전체 아이템(`items`) 중 검색어와 일치하는 아이템들만 필터링한 결과인 `filteredItems`를 메모이제이션 하세요.\n3. `useCallback`을 사용해 검색 입력창이 변경될 때 상태를 업데이트하는 핸들러 `handleSearchChange`를 메모이제이션 하세요.',
    theory: `
      ## React 핵심 내장 Hook 4가지
      - **\`useState\`**: 컴포넌트에 상태 변수를 제공합니다.
      - **\`useEffect\`**: 외부 시스템과 연동하는 사이드 이펙트를 처리합니다. (의존성 배열을 통해 실행 타이밍 조절)
      - **\`useMemo\`**: 비싼 연산의 결과를 캐싱하여 렌더링 성능을 최적화합니다.
      - **\`useCallback\`**: 렌더링 간에 함수 자체를 캐싱하여, 하위 컴포넌트에 불필요하게 새로운 참조가 넘겨지지 않도록 방지합니다.

      \`\`\`ts
      // useMemo 예시
      const processed = useMemo(() => {
        return items.filter(i => i.includes(query));
      }, [items, query]); // 의존성 배열 지정 필수!
      \`\`\`
    `,
    objectives: [
      'useState를 사용해 searchQuery 상태를 선언할 것',
      'useMemo를 사용해 searchQuery 조건에 따라 items를 필터링할 것',
      'useCallback을 사용해 입력값 변경 이벤트 핸들러를 메모이제이션할 것'
    ],
    exercise: "1. `PostList.tsx`에서 컴포넌트 마운트 시 API 호출을 실행하는 `useEffect` 훅을 등록하세요.\n2. 비동기로 데이터를 가져와 `posts` 상태에 바인딩하고, 컴포넌트가 언마운트되거나 훅이 다시 돌 때 클린업 함수가 돌도록 구성하세요."
  },
  initialFiles: [
    {
      name: 'SearchContainer.tsx',
      path: 'SearchContainer.tsx',
      content: `"use client";
import React, { useState, useMemo, useCallback } from 'react';

const ITEMS = ['Apple', 'Banana', 'Orange', 'Pineapple', 'Grapes'];

export default function SearchContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. 여기에 useMemo를 작성해 ITEMS 리스트를 searchQuery로 필터링하세요 (소문자/대문자 무관하게 비교 권장).
  // 2. 여기에 useCallback을 작성해 인풋 onChange 이벤트용 함수를 메모이제이션 하세요.

  return (
    <div>
      <input type="text" placeholder="Search..." />
      <ul>
        {ITEMS.map((item, idx) => (
          <li key={idx}>{item}</li>
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
        target: 'SearchContainer.tsx',
        pattern: 'useMemo(',
        message: 'useMemo 훅을 사용하여 필터링 작업을 연산 최적화해야 합니다.'
      },
      {
        type: 'includes',
        target: 'SearchContainer.tsx',
        pattern: 'useCallback(',
        message: 'useCallback 훅을 사용하여 입력값 변경 핸들러를 최적화해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`const filteredItems = useMemo(() => ITEMS.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);` 형태로 필터링 리스트를 선언해 보세요.'
    },
    {
      level: 2,
      content: '`const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value), []);` 형태로 이벤트 핸들러를 구현하고 input 태그에 `onChange={handleSearchChange}`를 연결하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `"use client";
import React, { useState, useEffect } from 'react';

export default function PostList() {
  const [posts, setPosts] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    let active = true;
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(res => res.json())
      .then(data => {
        if (active) {
          setPosts(data.slice(0, 5));
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}`
    }
  ]
}