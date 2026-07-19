import type { CurriculumStep } from '@/types/curriculum'

export const week_8_4: CurriculumStep = {
  id: 'week-8-4',
  title: '8주차 · TanStack Query 데이터 생성 및 캐시 무효화 (useMutation)',
  order: 46,
  category: 'advanced',
  content: {
    mission:
      '서버에 새로운 사용자를 추가하는 `useCreateUser` 커스텀 훅을 작성하세요.\n- \`useMutation\` 훅을 사용해 \`POST /api/users\` API를 호출하세요.\n- 유저가 정상적으로 추가된 직후(성공 콜백 \`onSuccess\` 내부), 기존의 유저 목록 캐시인 \`[\'users\']\` 쿼리 키를 무효화(invalidate)하여 목록을 즉시 리로드하도록 구현하세요.',
    theory: `
      ## 1. useMutation
      서버의 데이터를 수정, 추가, 삭제(C/U/D)하는 HTTP 요청에 사용합니다.
      \`\`\`ts
      import { useMutation, useQueryClient } from '@tanstack/react-query';

      const mutation = useMutation({
        mutationFn: postData,
        onSuccess: () => {
          // 데이터 처리 성공 시 실행할 로직
        }
      });
      \`\`\`

      ## 2. Query Invalidation (캐시 무효화)
      데이터가 변경된 경우 클라이언트 캐시 데이터는 오래된 데이터(Stale Data)가 됩니다. \`queryClient.invalidateQueries({ queryKey })\`를 실행하면 해당 쿼리가 Stale 상태로 표시되고 즉시 백그라운드 리페칭(refetching)이 촉발됩니다.
    `,
    objectives: [
      'useMutation 훅을 사용하여 POST 비동기 페처를 연동할 것',
      'useQueryClient 훅을 통해 queryClient 인스턴스를 가져올 것',
      'onSuccess 콜백에서 queryClient.invalidateQueries를 사용하여 ["users"] 캐시를 무효화할 것'
    ],
    exercise: "1. TanStack Query의 `useMutation` 훅을 사용해 새로운 글을 생성하는 `useCreatePost.ts`를 작성하세요.\n2. 성공 시 `queryClient.invalidateQueries`를 실행해 기존 `['posts']` 캐시 키를 무효화(새로고침)하도록 연동하세요."
  },
  initialFiles: [
    {
      name: 'useCreateUser.ts',
      path: 'hooks/useCreateUser.ts',
      content: `import { useMutation, useQueryClient } from '@tanstack/react-query';

// 여기에 useMutation과 invalidateQueries를 연동하는 useCreateUser 훅을 작성하세요.
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'hooks/useCreateUser.ts',
        pattern: 'useMutation(',
        message: 'useMutation 훅을 정의하여 서버 데이터를 추가해야 합니다.'
      },
      {
        type: 'includes',
        target: 'hooks/useCreateUser.ts',
        pattern: 'useQueryClient()',
        message: 'queryClient 인스턴스를 가져오기 위해 useQueryClient()를 호출해야 합니다.'
      },
      {
        type: 'regex',
        target: 'hooks/useCreateUser.ts',
        pattern: /invalidateQueries\(\s*\{\s*queryKey\s*:\s*\[\s*['"]users['"]\s*\]/,
        message: 'onSuccess 핸들러에서 [\'users\'] 쿼리 키를 무효화해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '먼저 `const queryClient = useQueryClient();`로 인스턴스를 생성한 다음, useMutation 옵션 객체 안에 `onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["users"] }); }`를 포함해 작성하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPost: { title: string; body: string }) => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(newPost),
        headers: { 'Content-Type': 'application/json' }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
}`
    }
  ]
}