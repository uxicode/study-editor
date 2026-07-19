import type { CurriculumStep } from '@/types/curriculum'

export const week_8_1: CurriculumStep = {
  id: 'week-8-1',
  title: '8주차 · Zustand 전역 상태 관리 기초',
  order: 43,
  category: 'advanced',
  content: {
    mission:
      '테마 상태(다크모드 활성화 여부)와 이를 변경하는 액션을 관리하는 Zustand 스토어 `useThemeStore`를 작성하세요.\n- 상태값: `isDarkMode` (boolean)\n- 액션: `toggleTheme` (isDarkMode 상태를 반전시키는 함수)',
    theory: `
      ## 1. Zustand
      Zustand는 가볍고 직관적이며 보일러플레이트가 극히 적은 React 상태 관리 라이브러리입니다. Context API와 달리 불필요한 리렌더링을 방지해 줍니다.

      ## 2. 스토어 선언 구조 (TypeScript)
      \`\`\`ts
      import { create } from 'zustand';

      interface StoreState {
        bears: number;
        increasePopulation: () => void;
      }

      export const useBearStore = create<StoreState>()((set) => ({
        bears: 0,
        increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
      }));
      \`\`\`
    `,
    objectives: [
      'create 함수를 import하여 전역 테마 스토어인 useThemeStore를 정의할 것',
      'isDarkMode(boolean) 필드와 toggleTheme(함수) 필드를 스토어에 포함할 것',
      'set 함수를 이용해 다크모드 상태를 반전(toggle)시키도록 구현할 것'
    ],
    exercise: "1. Zustand의 `create` 함수를 사용해 전역 상태를 보관하는 `useStore.ts`를 작성하세요.\n2. `count` 상태값과 이를 변경하는 `increase`, `decrease`, `reset` 액션을 구현하세요."
  },
  initialFiles: [
    {
      name: 'themeStore.ts',
      path: 'stores/themeStore.ts',
      content: `import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 여기에 create 헬퍼를 사용하여 useThemeStore를 구현하고 export 하세요.
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'stores/themeStore.ts',
        pattern: 'create<ThemeState>()',
        message: 'create 헬퍼와 ThemeState 타입을 지정하여 스토어를 선언해야 합니다.'
      },
      {
        type: 'regex',
        target: 'stores/themeStore.ts',
        pattern: /isDarkMode\s*:\s*false/,
        message: 'isDarkMode의 초기값을 false로 지정해야 합니다.'
      },
      {
        type: 'regex',
        target: 'stores/themeStore.ts',
        pattern: /set\(\s*\(state\)\s*=>\s*\{\s*isDarkMode\s*:\s*!state\.isDarkMode/,
        message: 'set 함수를 호출하여 현재 isDarkMode의 상태를 반전시켜야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '스토어는 `export const useThemeStore = create<ThemeState>()((set) => ({ isDarkMode: false, toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })) }));` 형태로 정의할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { create } from 'zustand';

interface CounterState {
  count: number;
  increase: () => void;
  decrease: () => void;
  reset: () => void;
}

export const useStore = create<CounterState>((set) => ({
  count: 0,
  increase: () => set((state) => ({ count: state.count + 1 })),
  decrease: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 })
}));`
    }
  ]
}