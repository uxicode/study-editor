import type { CurriculumStep } from '@/types/curriculum'

export const week_9_5: CurriculumStep = {
  id: 'week-9-5',
  title: '9주차 · 토큰 만료와 Silent Refresh 흐름 제어',
  order: 53,
  category: 'advanced',
  content: {
    mission:
      '인증 서버로부터 토큰을 자동 갱신하는 Axios 인터셉터(Interceptor) 응답 가로채기 논의 코드 일부를 구현하세요.\n- API 응답 에러 상태코드가 401(Unauthorized)일 때, 토큰 재발급 API(\`POST /api/auth/refresh\`)를 비동기로 호출하고 새로운 토큰을 획득하도록 핸들러를 작성하세요.',
    theory: `
      ## 1. Silent Refresh (조용한 갱신)
      액세스 토큰(Access Token)의 생명주기를 짧게 가져가고(예: 15분), 만료되었을 때 리프레시 토큰(Refresh Token)을 사용해 사용자 모르게 신규 토큰을 발급받아 로그인이 유지되도록 하는 메커니즘입니다.

      ## 2. HTTP 클라이언트 인터셉터 연동
      Axios와 같은 HTTP 클라이언트 라이브러리는 모든 응답에 대해 공통 전처리를 할 수 있는 \`interceptors.response.use()\` 메서드를 제공합니다. 이를 통해 401 Unauthorized 에러 시 토큰 리프레시 API를 호출하는 가로채기 동작을 설정할 수 있습니다.
    `,
    objectives: [
      '에러 상태 코드가 401인 경우를 식별해 분기 처리할 것',
      'axios.post("/api/auth/refresh")를 비동기로 호출하여 새 토큰 정보를 가져오는 뼈대를 작성할 것'
    ],
    exercise: "1. 로그아웃 비즈니스 로직을 구성하여 클라이언트 세션을 종료하고 만료 쿠키를 세팅하는 핸들러를 작성하세요.\n2. API 성공 시 클라이언트 전역 Zustand 인증스토어 세션을 null로 초기화하고 라우터를 홈 화면으로 리다이렉트하세요."
  },
  initialFiles: [
    {
      name: 'api.ts',
      path: 'lib/api.ts',
      content: `import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

// 여기에 401 에러 감지 시 Silent Refresh API 호출을 수행하는 인터셉터를 구현하세요.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // 1. 에러 코드가 401인지 판단
    // 2. "/auth/refresh" 호출을 수행하도록 작성하세요.
    return Promise.reject(error);
  }
);

export default api;
`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'lib/api.ts',
        pattern: '.status === 401',
        message: '에러 상태가 401(Unauthorized)인지 여부를 검사해야 합니다.'
      },
      {
        type: 'includes',
        target: 'lib/api.ts',
        pattern: '"/auth/refresh"',
        message: '토큰 갱신을 위해 "/auth/refresh" 주소로 POST 요청을 보내야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '`if (error.response && error.response.status === 401)` 조건을 통해 에러 상태를 감지할 수 있습니다.'
    },
    {
      level: 2,
      content: '조건 분기 내부에서 `const { data } = await axios.post("/api/auth/refresh");`를 작성하여 갱신 응답을 시뮬레이션하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: 'some-jwt-token',
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null });
  }
}));`
    }
  ]
}