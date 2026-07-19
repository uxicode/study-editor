import type { CurriculumStep } from '@/types/curriculum'

export const week_8_2: CurriculumStep = {
  id: 'week-8-2',
  title: '8주차 · Zustand Persist 미들웨어와 SSR Hydration 대응',
  order: 44,
  category: 'advanced',
  content: {
    mission:
      '인증 정보(`userToken`)를 로컬 스토리지에 자동 저장하고 복구하는 Zustand 스토어 `useAuthStore`를 작성하세요.\n- Zustand의 `persist` 미들웨어를 반드시 적용하세요.\n- Next.js의 SSR 환경에서 일어나는 서버-클라이언트 매치 오류(Hydration Mismatch)를 방지하기 위해 마운트 완료 여부를 판별하는 안전 마운트 커스텀 훅 `useSafeMount` 혹은 `useEffect` 연동 기법의 뼈대 예시 코드를 완성하세요.',
    theory: `
      ## 1. Zustand Persist 미들웨어
      상태값을 LocalStorage 또는 SessionStorage 등에 저장하여 브라우저 새로고침 후에도 유지되도록 돕습니다.
      \`\`\`ts
      import { persist } from 'zustand/middleware';
      export const useStore = create()(persist((set) => ({ ... }), { name: 'store-name' }));
      \`\`\`

      ## 2. SSR과 Hydration Mismatch 해결
      서버에서 프리렌더링할 때의 초기값(서버에선 localStorage가 없어 토큰이 비어있음)과 브라우저에서 마운트할 때의 실제 로드값이 달라지면 Next.js는 에러를 뿜습니다.
      - **해결 패턴**: 컴포넌트가 마운트(useEffect 실행 완료)된 후 화면을 그리도록 분기 처리를 해 주어야 안전합니다.
    `,
    objectives: [
      'persist 미들웨어를 사용해 스토어 데이터를 localStorage(이름: auth-storage)에 보존할 것',
      '컴포넌트 내에서 Hydration 오류가 발생하지 않도록 마운트 체크(mounted 상태) 로직을 연동할 것'
    ],
    exercise: "1. Zustand 스토어 데이터 보존을 위해 `persist` 미들웨어를 도입하세요.\n2. 로컬 스토리지 키 이름을 `theme-storage`로 지정하고 다크모드 설정을 로컬에 유지하도록 처리하세요."
  },
  initialFiles: [
    {
      name: 'authStore.ts',
      path: 'stores/authStore.ts',
      content: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  userToken: string | null;
  setToken: (token: string | null) => void;
}

// 1. 여기에 persist 미들웨어를 사용하여 useAuthStore를 작성하세요. (스토리지 이름: 'auth-storage')
`,
      language: 'typescript'
    },
    {
      name: 'Profile.tsx',
      path: 'components/Profile.tsx',
      content: `"use client";
import React, { useState, useEffect } from 'react';

export default function Profile() {
  const [mounted, setMounted] = useState(false);
  // 2. useEffect를 활용하여 마운트가 완료되었음을 감지하고 렌더링에 반영하세요.
  
  if (!mounted) return null; // Hydration 방어막

  return (
    <div>
      <p>My Profile Page</p>
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
        target: 'stores/authStore.ts',
        pattern: "name: 'auth-storage'",
        message: '스토리지 식별 이름을 auth-storage로 설정해야 합니다.'
      },
      {
        type: 'includes',
        target: 'stores/authStore.ts',
        pattern: 'persist(',
        message: 'Zustand의 persist 미들웨어를 사용하여 상태 보존을 구현해야 합니다.'
      },
      {
        type: 'regex',
        target: 'components/Profile.tsx',
        pattern: /setMounted\(\s*true\s*\)/,
        message: 'Profile 컴포넌트 마운트 시 useEffect 내부에서 setMounted(true)를 명시해 주어야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '스토어는 `export const useAuthStore = create<AuthState>()(persist((set) => ({ userToken: null, setToken: (token) => set({ userToken: token }) }), { name: "auth-storage" }));` 형태로 구성할 수 있습니다.'
    },
    {
      level: 2,
      content: 'Profile 컴포넌트의 useEffect 내부에 `setMounted(true)`를 작성하고, 의존성 배열에 빈 배열 `[]`을 할당하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode }))
    }),
    {
      name: 'theme-storage'
    }
  )
);`
    }
  ]
}