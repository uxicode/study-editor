import type { CurriculumStep } from '@/types/curriculum'

export const week_9_final: CurriculumStep = {
  id: 'week-9-final',
  title: '9주차 종합 · 통합 인증 시스템 연동 실습 (Login & Auth Integration)',
  order: 54,
  category: 'advanced',
  content: {
    mission:
      '사용자 로그인 요청을 처리하고 인증 성공 시 토큰을 보관하는 통합 로그인 커스텀 훅 `useLoginSubmit`을 구현하세요.\n- `react-hook-form`의 `useForm`을 `zodResolver(loginSchema)`와 연동하여 폼 제출 데이터 유효성을 사전 검증하세요.\n- 유효성 검사 통과 시 `POST /api/auth/login` API를 비동기로 호출하고, 발급받은 액세스 토큰을 Zustand 전역 인증 스토어(`useAuthStore`)의 `setToken` 액션을 통해 저장하도록 연동하세요.',
    theory: `
      ## 9주차 종합: 클라이언트 전역 인증 흐름 완성

      회원가입, 로그인 폼 유효성 검증, API 호출, 전역 상태 보관 및 로컬 스토리지 동기화, 페이지 보호(미들웨어) 등 지금까지 배운 모든 보안과 인증 과정을 하나로 엮는 연동 실습입니다.

      ### 1. react-hook-form + Zod 스키마 리졸버 연동
      \`\`\`ts
      import { useForm } from 'react-hook-form';
      import { zodResolver } from '@hookform/resolvers/zod';

      const { register, handleSubmit } = useForm({
        resolver: zodResolver(loginSchema)
      });
      \`\`\`

      ### 2. 인증 토큰 전역 보관
      발급받은 토큰 정보를 Zustand 스토어에 바인딩하여 앱 전체가 로그인 상태를 유지하도록 제어합니다.
    `,
    objectives: [
      'react-hook-form의 useForm과 zodResolver를 결합하여 폼 검증 컨트롤러를 선언할 것',
      'API 호출 성공 시 Zustand useAuthStore 스토어의 setToken 액션을 호출하여 토큰을 저장할 것'
    ],
    exercise: "1. Next.js 통합 인증 프로젝트용 전송 모듈 및 상태 조율 허브를 완성하세요.\n2. 유저 정보, 리프레시 타이머, 폼 상태 제어 로직을 통합하여 단일 파일 묶음에 조립하고, 예외 처리를 추가하세요."
  },
  initialFiles: [
    {
      name: 'useLoginSubmit.ts',
      path: 'hooks/useLoginSubmit.ts',
      content: `"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/loginSchema';
import { useAuthStore } from '../stores/authStore';

export function useLoginSubmit() {
  const setToken = useAuthStore((state) => state.setToken);
  
  // 1. 여기에 useForm과 zodResolver(loginSchema)를 연동하세요.
  // 2. 로그인 성공 시 setToken(token)을 호출해 토큰을 전역 보관하는 Submit 함수를 구현하세요.
  
  return {
    onSubmit: async (data: any) => {}
  };
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'hooks/useLoginSubmit.ts',
        pattern: 'zodResolver(loginSchema)',
        message: 'react-hook-form에 zodResolver(loginSchema) 유효성 필터를 연결해야 합니다.'
      },
      {
        type: 'includes',
        target: 'hooks/useLoginSubmit.ts',
        pattern: 'setToken(',
        message: '로그인 성공 시 Zustand 스토어의 setToken() 액션을 호출하여 토큰을 보존해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: 'useForm 선언부에 `resolver: zodResolver(loginSchema)`를 전달하여 폼 유효성 파이프라인을 설정하세요.'
    },
    {
      level: 2,
      content: 'onSubmit 함수 내부에서 `const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify(data) }).then(r => r.json());` 및 `setToken(res.accessToken);`를 호출하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { create } from 'zustand';

interface AuthState {
  user: { email: string; role: string } | null;
  token: string | null;
  login: (user: { email: string; role: string }, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}));

export async function refreshSession() {
  const res = await fetch('/api/refresh', { method: 'POST' });
  if (!res.ok) throw new Error('Session refresh failed');
  const data = await res.json();
  return data.token;
}`
    }
  ]
}