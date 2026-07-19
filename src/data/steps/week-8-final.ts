import type { CurriculumStep } from '@/types/curriculum'

export const week_8_final: CurriculumStep = {
  id: 'week-8-final',
  title: '8주차 종합 · 실시간 칸반 보드 개발 (Zustand & TanStack Query)',
  order: 48,
  category: 'advanced',
  content: {
    mission:
      'Zustand 전역 상태와 TanStack Query를 함께 융합하여 드래그앤드롭 혹은 버튼을 통한 상태 이동 기능이 연동된 칸반 보드 컴포넌트(`TaskBoard.tsx`)를 구현하세요.\n- Zustand 스토어 `useBoardStore`로부터 현재 드래그 타겟인 작업 ID(`activeTaskId`) 상태와 이를 업데이트하는 액션(`setActiveTaskId`)을 사용해 로컬 상태를 변경하세요.\n- TanStack Query의 `useMutation`을 실행하여 카드의 컬럼 상태(Todo -> Progress -> Done)를 서버에 업데이트(API: `PATCH /api/tasks`)하고 성공 시 `[\'tasks\']` 캐시를 무효화(invalidate)하세요.',
    theory: `
      ## 8주차 종합: 전역 상태 & 서버 캐시의 조화로운 연동

      클라이언트에서 UI의 빠른 반응을 유도하는 인터랙션 관련 전역 변수(active 드래그 요소, 다이얼로그 모달 온오프 등)는 **Zustand**로 제어하고, 실제 데이터베이스와 동기화되는 서비스 리소스 데이터는 **TanStack Query**로 다룹니다.

      ### 1. 역할 분담
      - **Zustand**: 화면 상태, 로컬 드래그 정보, 모달 오픈 상태 등
      - **TanStack Query**: 테스크 목록 조회, DB 상태변경 PATCH API 호출 및 무효화 관리
    `,
    objectives: [
      'Zustand 스토어 useBoardStore로부터 activeTaskId 및 setActiveTaskId를 선택해서 활용할 것',
      'useMutation 훅을 이용해 PATCH /api/tasks 호출을 매핑할 것',
      '상태 변경 성공 시 queryClient.invalidateQueries({ queryKey: ["tasks"] })를 처리할 것'
    ],
    exercise: "1. 상품 상세를 조회하는 무효화 연동 상품 뷰어용 스토어 및 데이터 fetch 훅 세트를 결합하세요.\n2. Zustand 스토어에서 선택된 상품 ID를 감지하고, TanStack Query 훅의 쿼리 키에 바인딩하여 자동으로 동기화되도록 조율하세요."
  },
  initialFiles: [
    {
      name: 'TaskBoard.tsx',
      path: 'components/TaskBoard.tsx',
      content: `"use client";
import React from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { create } from 'zustand';

interface BoardState {
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
}

export const useBoardStore = create<BoardState>()((set) => ({
  activeTaskId: null,
  setActiveTaskId: (id) => set({ activeTaskId: id }),
}));

export default function TaskBoard() {
  const queryClient = useQueryClient();
  const { activeTaskId, setActiveTaskId } = useBoardStore();

  // 1. 여기에 useMutation을 활용하여 PATCH /api/tasks API 호출을 구현하세요.
  // 2. 성공 시 "tasks" 캐시를 무효화(invalidate)하세요.

  return (
    <div className="task-board">
      <p>Active Task: {activeTaskId}</p>
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
        target: 'components/TaskBoard.tsx',
        pattern: 'useBoardStore()',
        message: 'Zustand 스토어 훅인 useBoardStore를 호출하여 전역 클라이언트 상태를 가져와야 합니다.'
      },
      {
        type: 'includes',
        target: 'components/TaskBoard.tsx',
        pattern: 'useMutation(',
        message: '태스크 수정을 위한 useMutation 훅을 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'components/TaskBoard.tsx',
        pattern: /invalidateQueries\(\s*\{\s*queryKey\s*:\s*\[\s*['"]tasks['"]\s*\]/,
        message: '상태 수정 성공 핸들러에서 [\'tasks\'] 쿼리를 무효화해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: 'PATCH API 호출을 위한 useMutation 코드 내 onSuccess 콜백을 정의하여 `queryClient.invalidateQueries({ queryKey: ["tasks"] })`를 호출하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';

interface ProductStore {
  selectedProductId: number;
  setSelectedProductId: (id: number) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProductId: 1,
  setSelectedProductId: (id) => set({ selectedProductId: id })
}));

export function useProductDetail(productId: number) {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const res = await fetch(\`https://jsonplaceholder.typicode.com/products/\${productId}\`);
      return res.json();
    }
  });
}`
    }
  ]
}