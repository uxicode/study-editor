import type { CurriculumStep } from '@/types/curriculum'

export const week_8_3: CurriculumStep = {
  id: 'week-8-3',
  title: '8주차 · TanStack Query (React Query) 비동기 조회 기초',
  order: 45,
  category: 'advanced',
  content: {
    mission:
      '서버로부터 유저 목록을 받아오는 `useQuery` 커스텀 훅 `useFetchUsers`를 작성하세요.\n- API URL: `/api/users` (비동기 fetch 호출)\n- 쿼리 키(Query Key): `[\'users\']`로 설정할 것\n- 반환 정보: 쿼리 실행 결과인 `data`, `isLoading`, `isError`를 포함하여 리턴할 것',
    theory: `
      ## 1. TanStack Query (React Query)
      서버 상태(Server State) 관리 라이브러리로 캐싱, 백그라운드 갱신, 동기화, 로딩/에러 상태 관리 등을 자동으로 수행해 줍니다.

      ## 2. useQuery 기본 구조
      \`\`\`ts
      import { useQuery } from '@tanstack/react-query';

      const { data, isLoading, isError } = useQuery({
        queryKey: ['todo'],
        queryFn: fetchTodos, // Promise를 리턴하는 비동기 함수
      });
      \`\`\`
      - **queryKey**: 캐시를 식별하는 고유한 값으로 의존성 배열 역할도 겸합니다.
      - **queryFn**: 데이터를 불러오는 실제 Fetch 함수입니다.
    `,
    objectives: [
      'useQuery 훅을 import하여 비동기 호출을 정의할 것',
      'queryKey 값을 ["users"] 형태로 지정할 것',
      'fetch("/api/users") 응답을 json으로 변환해 리턴하는 비동기 fetcher(queryFn)를 구현할 것'
    ],
    exercise: "1. TanStack Query의 `useQuery` 훅을 사용해 포스트 데이터를 가져오는 `usePosts.ts`를 작성하세요.\n2. 쿼리 키를 `['posts']`로 명시하고 비동기 fetch 호출로 연결하세요."
  },
  initialFiles: [
    {
      name: 'useUsers.ts',
      path: 'hooks/useUsers.ts',
      content: `import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  name: string;
}

// 여기에 useQuery를 사용해 사용자 정보를 호출하는 useFetchUsers 훅을 작성하세요.
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'hooks/useUsers.ts',
        pattern: 'useQuery({',
        message: 'useQuery 훅 객체를 전달 인자로 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'hooks/useUsers.ts',
        pattern: /queryKey\s*:\s*\[\s*['"]users['"]\s*\]/,
        message: 'queryKey는 [\'users\'] 형태로 설정해야 합니다.'
      },
      {
        type: 'includes',
        target: 'hooks/useUsers.ts',
        pattern: '/api/users',
        message: 'api 호출 주소는 "/api/users" 여야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`export function useFetchUsers() { return useQuery<User[]>({ queryKey: ["users"], queryFn: () => fetch("/api/users").then(res => res.json()) }); }` 의 형태로 훅을 구성하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { useQuery } from '@tanstack/react-query';

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      return res.json();
    }
  });
}`
    }
  ]
}