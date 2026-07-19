import type { CurriculumStep } from '@/types/curriculum'

export const week_8_5: CurriculumStep = {
  id: 'week-8-5',
  title: '8주차 · Next.js 서버사이드 렌더링(SSR)과 Query 캐시 prefetch',
  order: 47,
  category: 'advanced',
  content: {
    mission:
      '서버 컴포넌트 환경에서 유저 목록을 사전 페칭(prefetch)하여 캐시 데이터를 dehydrate(직렬화)한 후, 클라이언트 컴포넌트로 전달하는 Next.js 서버 페이지 컴포넌트(`UsersServerPage`)를 완성하세요.\n- `QueryClient` 인스턴스를 생성하세요.\n- `queryClient.prefetchQuery`를 사용해 `[\'users\']` 키를 가진 데이터를 서버에서 미리 요청하세요.\n- `<HydrationBoundary state={dehydrate(queryClient)}>` 컴포넌트로 클라이언트 자식 요소를 감싸 반환하세요.',
    theory: `
      ## 1. SSR과 TanStack Query 통합
      서버 사이드 렌더링(SSR) 시점에 캐시를 채워두면 사용자가 페이지를 열었을 때 깜빡임(LCP 저하) 없이 완성된 HTML을 바로 볼 수 있고, 클라이언트 마운트 이후에도 기존 서버 캐시를 즉시 활용합니다.

      ## 2. Prefetch 및 Hydration 흐름
      1. 서버 컴포넌트 내부에서 임시 \`QueryClient\`를 생성합니다.
      2. \`queryClient.prefetchQuery\`로 데이터를 서버에서 미리 캐싱합니다.
      3. \`dehydrate(queryClient)\`를 통해 캐시 스냅샷을 텍스트로 직렬화(dehydrate)합니다.
      4. \`HydrationBoundary\` 컴포넌트에 주입하여 클라이언트가 이를 해석(hydrate)하여 사용하게 만듭니다.
    `,
    objectives: [
      'new QueryClient()를 선언하여 서버 측 쿼리 클라이언트를 만들 것',
      'prefetchQuery를 통해 ["users"] 쿼리 키를 갖는 데이터를 사전 로드할 것',
      'HydrationBoundary에 dehydrate(queryClient) 상태를 담아서 하위 요소를 렌더링하도록 뼈대 코드를 작성할 것'
    ],
    exercise: "1. Next.js 서버 컴포넌트에서 프리페치(Prefetch)를 적용하기 위해 `dehydrate`와 `QueryClient`, `HydrationBoundary`를 구성하세요.\n2. 프리페치 결과 캐시를 직렬화하여 클라이언트에 스트리밍하는 파일 구조를 작성하세요."
  },
  initialFiles: [
    {
      name: 'page.tsx',
      path: 'app/users/page.tsx',
      content: `import React from 'react';
import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import UsersList from '@/components/UsersList'; // 클라이언트 컴포넌트

export default async function UsersServerPage() {
  // 1. QueryClient 인스턴스를 생성하세요.
  // 2. ["users"] 쿼리 키 데이터를 prefetchQuery 하세요.
  
  return (
    // 3. HydrationBoundary state={} 속성을 바인딩하여 자식 컴포넌트를 감싸 반환하세요.
    <UsersList />
  );
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app/users/page.tsx',
        pattern: 'new QueryClient()',
        message: '임시 QueryClient 인스턴스를 생성해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app/users/page.tsx',
        pattern: 'prefetchQuery(',
        message: 'prefetchQuery() 메서드를 사용해 캐시를 채워야 합니다.'
      },
      {
        type: 'includes',
        target: 'app/users/page.tsx',
        pattern: 'dehydrate(queryClient)',
        message: 'dehydrate(queryClient)를 HydrationBoundary의 state 속성값에 주입해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '비동기 prefetchQuery이므로 반드시 `await queryClient.prefetchQuery({ queryKey: ["users"], queryFn: fetchUsers })` 형태로 작성해야 합니다.'
    },
    {
      level: 2,
      content: '리턴문은 `<HydrationBoundary state={dehydrate(queryClient)}><UsersList /></HydrationBoundary>` 형태로 감싸 반환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { QueryClient, dehydrate } from '@tanstack/react-query';

export async function getDehydratedPosts() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      return res.json();
    }
  });
  return dehydrate(queryClient);
}`
    }
  ]
}