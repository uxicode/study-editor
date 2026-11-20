import type { FlowSpec } from '@/types/flow'

/** Next.js & 프론트엔드(week-7 ~ week-9) 흐름 다이어그램 */

const SERVER_CLIENT_COMPONENTS: FlowSpec = {
  title: 'Server Component 와 Client Component',
  nodes: [
    { id: 'server', label: 'Next.js 서버', icon: '🖥️', x: 0, y: 1.3, tone: 'gray' },
    { id: 'rsc', label: 'Server Comp.', icon: '🧱', x: 2, y: 0, tone: 'blue' },
    { id: 'client', label: 'Client Comp.', icon: '🖱️', x: 2, y: 2.6, tone: 'orange' },
    { id: 'browser', label: '브라우저', icon: '🌐', x: 4, y: 1.3, tone: 'green' }
  ],
  edges: [
    { from: 'server', to: 'rsc' },
    { from: 'server', to: 'client' },
    { from: 'rsc', to: 'browser' },
    { from: 'client', to: 'browser' }
  ],
  stages: [
    {
      title: '서버에서 렌더링',
      description: 'App Router 의 컴포넌트는 기본이 **Server Component** 입니다. 서버에서 HTML 로 렌더링되고, 그 컴포넌트의 JS 는 브라우저로 가지 않습니다.',
      packets: [
        { from: 'server', to: 'rsc', kind: 'request', label: '렌더' },
        { from: 'rsc', to: 'browser', kind: 'event', label: 'HTML' }
      ],
      active: ['rsc'],
      dimmed: ['client'],
      metrics: [{ label: '보낸 JS', value: '0 KB', tone: 'good' }]
    },
    {
      title: "'use client'",
      description: "파일 맨 위에 `'use client'` 를 쓴 컴포넌트는 HTML 과 함께 **JS 번들도** 브라우저로 보내집니다.",
      packets: [
        { from: 'server', to: 'client', kind: 'request', label: '렌더' },
        { from: 'client', to: 'browser', kind: 'event', label: 'HTML + JS' }
      ],
      active: ['client'],
      badges: [{ node: 'client', text: "'use client'" }],
      metrics: [{ label: '보낸 JS', value: '+ CounterButton' }]
    },
    {
      title: '하이드레이션',
      description: '브라우저가 JS 를 실행해 이미 그려진 HTML 에 이벤트를 연결합니다. 이제 버튼이 **클릭에 반응**합니다.',
      packets: [{ from: 'browser', to: 'client', kind: 'event', label: 'hydrate' }],
      active: ['browser', 'client'],
      badges: [{ node: 'browser', text: '클릭 가능', tone: 'good' }]
    },
    {
      title: '클릭',
      description: '`useState` 로 관리하는 조회수는 **브라우저 안에서** 바뀝니다. 서버에 다시 묻지 않습니다.',
      packets: [
        { from: 'browser', to: 'client', kind: 'request', label: 'onClick' },
        { from: 'client', to: 'browser', kind: 'response', label: 'count + 1' }
      ],
      active: ['client'],
      dimmed: ['server', 'rsc'],
      metrics: [{ label: '서버 요청', value: '0회', tone: 'good' }]
    },
    {
      title: '서버에서 hooks 를 쓰면',
      description: "`'use client'` 없이 `useState` · `onClick` 을 쓰면 서버 컴포넌트라서 **빌드 에러**가 납니다.",
      packets: [{ from: 'rsc', to: 'server', kind: 'error', label: 'useState ✕' }],
      failed: ['rsc'],
      badges: [{ node: 'rsc', text: 'hooks 사용 불가', tone: 'danger' }],
      metrics: [{ label: '빌드', value: '실패', tone: 'danger' }]
    }
  ]
}

const USE_QUERY: FlowSpec = {
  title: 'useQuery 와 쿼리 캐시',
  nodes: [
    { id: 'list', label: 'UsersList', icon: '📋', x: 0, y: 1.3, tone: 'orange' },
    { id: 'cache', label: "캐시 ['users']", icon: '🗃️', x: 2, y: 0, tone: 'yellow' },
    { id: 'other', label: 'UserCount', icon: '🔢', x: 0, y: -1.3, tone: 'orange' },
    { id: 'api', label: '/api/users', icon: '🚪', x: 4, y: 1.3, tone: 'blue' }
  ],
  edges: [
    { from: 'list', to: 'cache' },
    { from: 'other', to: 'cache' },
    { from: 'cache', to: 'api' }
  ],
  stages: [
    {
      title: '첫 요청',
      description: "컴포넌트가 `useQuery({ queryKey: ['users'] })` 를 부르면 캐시를 먼저 봅니다. 비어 있으니 `fetch` 가 나갑니다.",
      packets: [
        { from: 'list', to: 'cache', kind: 'request', label: "['users']" },
        { from: 'cache', to: 'api', kind: 'request', label: 'fetch' }
      ],
      badges: [{ node: 'cache', text: '비어 있음' }],
      dimmed: ['other'],
      metrics: [{ label: 'isLoading', value: 'true' }]
    },
    {
      title: '응답 저장',
      description: '응답은 캐시에 저장되고, 컴포넌트는 `data` 를 받아 다시 그려집니다.',
      packets: [
        { from: 'api', to: 'cache', kind: 'response', label: 'users[]' },
        { from: 'cache', to: 'list', kind: 'response', label: 'data' }
      ],
      active: ['cache'],
      dimmed: ['other'],
      metrics: [{ label: 'isLoading', value: 'false', tone: 'good' }]
    },
    {
      title: '같은 키 공유',
      description: '다른 컴포넌트가 **같은 쿼리 키**를 쓰면 네트워크 요청 없이 캐시에서 바로 받습니다.',
      packets: [
        { from: 'other', to: 'cache', kind: 'request', label: "['users']" },
        { from: 'cache', to: 'other', kind: 'response', label: '캐시' }
      ],
      active: ['cache'],
      dimmed: ['api'],
      badges: [{ node: 'cache', text: '같은 키 = 요청 1번', tone: 'good' }],
      metrics: [{ label: '네트워크 요청', value: '1회', tone: 'good' }]
    },
    {
      title: 'stale 후 다시 보기',
      description: '데이터가 오래되면(stale) 창에 다시 포커스할 때 **기존 데이터를 먼저 보여 주고** 뒤에서 새로 가져옵니다.',
      packets: [
        { from: 'cache', to: 'list', kind: 'response', label: '기존 data' },
        { from: 'cache', to: 'api', kind: 'request', label: 'refetch' },
        { from: 'api', to: 'cache', kind: 'response', label: '새 data' },
        { from: 'cache', to: 'list', kind: 'response' }
      ],
      badges: [{ node: 'cache', text: 'stale', tone: 'warn' }],
      metrics: [{ label: '로딩 스피너', value: '없음', tone: 'good' }]
    },
    {
      title: '요청 실패',
      description: '서버가 실패하면 `isError` 가 `true` 가 됩니다. 컴포넌트는 에러 화면을 그려야 합니다.',
      packets: [
        { from: 'cache', to: 'api', kind: 'request', label: 'fetch' },
        { from: 'api', to: 'cache', kind: 'error', label: '500' },
        { from: 'cache', to: 'list', kind: 'error', label: 'isError' }
      ],
      failed: ['api'],
      dimmed: ['other'],
      metrics: [{ label: 'isError', value: 'true', tone: 'danger' }]
    }
  ]
}

const MUTATION: FlowSpec = {
  title: 'useMutation 과 캐시 무효화',
  nodes: [
    { id: 'form', label: '추가 폼', icon: '✍️', x: 0, y: 1.3, tone: 'orange' },
    { id: 'cache', label: "캐시 ['users']", icon: '🗃️', x: 2, y: 0, tone: 'yellow' },
    { id: 'list', label: '사용자 목록', icon: '📋', x: 2, y: 2.6, tone: 'green' },
    { id: 'api', label: '/api/users', icon: '🚪', x: 4, y: 1.3, tone: 'blue' }
  ],
  edges: [
    { from: 'form', to: 'api' },
    { from: 'form', to: 'cache' },
    { from: 'cache', to: 'api' },
    { from: 'cache', to: 'list' }
  ],
  stages: [
    {
      title: 'mutate',
      description: '`mutate(newUser)` 가 `POST /api/users` 를 보내고, 서버는 저장에 성공합니다.',
      packets: [
        { from: 'form', to: 'api', kind: 'request', label: 'POST' },
        { from: 'api', to: 'form', kind: 'response', label: '201' }
      ],
      active: ['api'],
      metrics: [{ label: '서버 데이터', value: '사용자 4명' }]
    },
    {
      title: '무효화하지 않으면',
      description: "캐시는 서버가 바뀐 걸 모릅니다. 목록은 여전히 **예전 3명**을 보여 줍니다.",
      packets: [{ from: 'cache', to: 'list', kind: 'response', label: '옛 목록' }],
      badges: [{ node: 'list', text: '새 사용자 안 보임', tone: 'danger' }],
      metrics: [
        { label: '서버 데이터', value: '4명' },
        { label: '화면', value: '3명', tone: 'danger' }
      ]
    },
    {
      title: 'onSuccess 에서 무효화',
      description: "`onSuccess` 에서 `invalidateQueries({ queryKey: ['users'] })` 를 부르면 캐시가 stale 이 되고, **보고 있는 목록이 자동으로 다시 조회**됩니다.",
      packets: [
        { from: 'form', to: 'cache', kind: 'event', label: 'invalidate' },
        { from: 'cache', to: 'api', kind: 'request', label: 'refetch' },
        { from: 'api', to: 'cache', kind: 'response', label: '4명' },
        { from: 'cache', to: 'list', kind: 'response', label: '새 목록' }
      ],
      active: ['cache', 'list'],
      metrics: [
        { label: '서버 데이터', value: '4명' },
        { label: '화면', value: '4명', tone: 'good' }
      ]
    }
  ]
}

const SSR_PREFETCH: FlowSpec = {
  title: '서버 prefetch 와 HydrationBoundary',
  nodes: [
    { id: 'page', label: 'Server Page', icon: '🖥️', x: 0, y: 1.3, tone: 'blue' },
    { id: 'api', label: 'API · DB', icon: '🗄️', x: 2, y: 0, tone: 'teal' },
    { id: 'browser', label: '브라우저', icon: '🌐', x: 2, y: 2.6, tone: 'green' },
    { id: 'client', label: 'Client Comp.', icon: '📋', x: 4, y: 1.3, tone: 'orange' }
  ],
  edges: [
    { from: 'page', to: 'api' },
    { from: 'page', to: 'browser' },
    { from: 'browser', to: 'client' },
    { from: 'client', to: 'api' }
  ],
  stages: [
    {
      title: 'prefetch',
      description: "서버 페이지가 `new QueryClient()` 를 만들고 `prefetchQuery({ queryKey: ['users'] })` 로 데이터를 **서버에서 미리** 가져옵니다.",
      packets: [
        { from: 'page', to: 'api', kind: 'request', label: 'prefetchQuery' },
        { from: 'api', to: 'page', kind: 'response', label: 'users' }
      ],
      active: ['page'],
      dimmed: ['client'],
      badges: [{ node: 'page', text: '서버 QueryClient 에 저장' }]
    },
    {
      title: 'dehydrate',
      description: '`dehydrate(queryClient)` 로 캐시를 직렬화해 HTML 과 함께 보냅니다.',
      packets: [{ from: 'page', to: 'browser', kind: 'event', label: 'HTML + 캐시' }],
      active: ['browser'],
      badges: [{ node: 'browser', text: '<HydrationBoundary>' }]
    },
    {
      title: '캐시 채우고 바로 표시',
      description: "클라이언트의 `useQuery(['users'])` 는 이미 채워진 캐시를 받아 **로딩 없이 바로** 그립니다.",
      packets: [{ from: 'browser', to: 'client', kind: 'event', label: '캐시 채움' }],
      active: ['client'],
      dimmed: ['api'],
      metrics: [
        { label: '로딩 스피너', value: '없음', tone: 'good' },
        { label: '클라이언트 요청', value: '0회', tone: 'good' }
      ]
    },
    {
      title: 'prefetch 가 없다면',
      description: '빈 캐시로 시작하므로 화면이 뜬 뒤에야 요청이 나가고, 사용자는 **스피너를 먼저** 봅니다.',
      packets: [
        { from: 'page', to: 'browser', kind: 'event', label: 'HTML (빈 캐시)' },
        { from: 'browser', to: 'client', kind: 'event' },
        { from: 'client', to: 'api', kind: 'request', label: 'fetch' },
        { from: 'api', to: 'client', kind: 'response' }
      ],
      badges: [{ node: 'client', text: '로딩 중…', tone: 'warn' }],
      metrics: [
        { label: '로딩 스피너', value: '보임', tone: 'danger' },
        { label: '클라이언트 요청', value: '1회' }
      ]
    }
  ]
}

const SESSION_VS_TOKEN: FlowSpec = {
  title: '세션 vs 토큰, 그리고 쿠키 속성',
  nodes: [
    { id: 'browser', label: '브라우저', icon: '🌐', x: 0, y: 1.3, tone: 'green' },
    { id: 'server', label: '서버', icon: '🖥️', x: 2, y: 0, tone: 'blue' },
    { id: 'store', label: '세션 저장소', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' },
    { id: 'script', label: '악성 스크립트', icon: '🐛', x: 2, y: 2.6, tone: 'red' },
    { id: 'evil', label: '다른 사이트', icon: '🕳️', x: 4, y: -1.3, tone: 'gray' }
  ],
  edges: [
    { from: 'browser', to: 'server' },
    { from: 'server', to: 'store' },
    { from: 'script', to: 'browser' },
    { from: 'evil', to: 'server' }
  ],
  stages: [
    {
      title: '세션 방식',
      description: '쿠키에는 무작위 `sid` 만 있고, 서버가 요청마다 **저장소에서 사용자를 찾습니다.**',
      packets: [
        { from: 'browser', to: 'server', kind: 'request', label: 'sid=abc' },
        { from: 'server', to: 'store', kind: 'request', label: 'abc 조회' },
        { from: 'store', to: 'server', kind: 'response', label: 'user 7' },
        { from: 'server', to: 'browser', kind: 'response' }
      ],
      dimmed: ['script', 'evil'],
      metrics: [{ label: '요청당 저장소 조회', value: '1회' }]
    },
    {
      title: '토큰 방식',
      description: '쿠키에 서명된 토큰(JWT)이 있으면 서버는 **서명과 만료만 확인**합니다. 저장소를 거치지 않습니다.',
      packets: [
        { from: 'browser', to: 'server', kind: 'request', label: 'access_token=JWT' },
        { from: 'server', to: 'browser', kind: 'response' }
      ],
      dimmed: ['store', 'script', 'evil'],
      badges: [{ node: 'server', text: '서명만 검증', tone: 'good' }],
      metrics: [{ label: '요청당 저장소 조회', value: '0회', tone: 'good' }]
    },
    {
      title: 'HttpOnly',
      description: '`HttpOnly` 쿠키는 `document.cookie` 로 읽을 수 없습니다. XSS 스크립트가 토큰을 **훔쳐 가지 못합니다.**',
      packets: [
        { from: 'script', to: 'browser', kind: 'request', label: 'document.cookie' },
        { from: 'browser', to: 'script', kind: 'error', label: '읽을 수 없음' }
      ],
      dimmed: ['store', 'evil'],
      badges: [{ node: 'browser', text: 'HttpOnly', tone: 'good' }]
    },
    {
      title: 'SameSite=Lax',
      description: '다른 사이트에서 몰래 보낸 POST 에는 쿠키가 **실리지 않아** 로그인 상태로 처리되지 않습니다 (CSRF 방어).',
      packets: [
        { from: 'evil', to: 'server', kind: 'error', label: 'POST (쿠키 없음)' },
        { from: 'server', to: 'evil', kind: 'error', label: '401' }
      ],
      dimmed: ['store', 'script'],
      badges: [{ node: 'server', text: 'SameSite=Lax', tone: 'good' }]
    }
  ]
}

const LOGIN_API: FlowSpec = {
  title: '로그인 API: 검증 → 비교 → 토큰 → 쿠키',
  nodes: [
    { id: 'form', label: '로그인 폼', icon: '🔑', x: 0, y: 1.3, tone: 'orange' },
    { id: 'route', label: 'POST /login', icon: '🚪', x: 2, y: 0, tone: 'blue' },
    { id: 'bcrypt', label: 'bcrypt', icon: '🧂', x: 2, y: 2.6, tone: 'purple' },
    { id: 'db', label: 'users', icon: '🗄️', x: 4, y: 1.3, tone: 'teal' }
  ],
  edges: [
    { from: 'form', to: 'route' },
    { from: 'route', to: 'db' },
    { from: 'route', to: 'bcrypt' }
  ],
  stages: [
    {
      title: '형식 검증',
      description: '`loginSchema.safeParse(body)` 가 실패하면 DB 를 보기 전에 **400** 으로 끝냅니다.',
      packets: [
        { from: 'form', to: 'route', kind: 'request', label: "email: ''" },
        { from: 'route', to: 'form', kind: 'error', label: '400' }
      ],
      dimmed: ['db', 'bcrypt'],
      badges: [{ node: 'route', text: 'zod safeParse' }]
    },
    {
      title: '사용자 조회',
      description: '이메일로 사용자를 찾습니다. 없을 수도 있습니다.',
      packets: [
        { from: 'form', to: 'route', kind: 'request', label: 'email, password' },
        { from: 'route', to: 'db', kind: 'request', label: 'findUnique' },
        { from: 'db', to: 'route', kind: 'response', label: 'user | null' }
      ],
      dimmed: ['bcrypt']
    },
    {
      title: '항상 비교',
      description: '사용자가 없어도 `DUMMY_PASSWORD_HASH` 로 **똑같이 비교**합니다. 응답 시간 차이로 가입된 이메일을 알아낼 수 없게 하기 위함입니다.',
      packets: [
        { from: 'route', to: 'bcrypt', kind: 'request', label: 'hash ?? DUMMY' },
        { from: 'bcrypt', to: 'route', kind: 'response', label: 'false' }
      ],
      active: ['bcrypt'],
      badges: [{ node: 'bcrypt', text: '항상 같은 시간', tone: 'good' }],
      metrics: [{ label: '응답 시간 차이', value: '없음', tone: 'good' }]
    },
    {
      title: '실패 응답 통일',
      description: '없는 이메일이든 틀린 비밀번호든 **같은 401, 같은 문구**를 보냅니다.',
      packets: [{ from: 'route', to: 'form', kind: 'error', label: '401 같은 문구' }],
      badges: [{ node: 'route', text: '이메일 또는 비밀번호가…', tone: 'warn' }]
    },
    {
      title: '성공',
      description: '15분짜리 토큰을 `SignJWT` 로 서명해 **응답 본문이 아니라 HttpOnly 쿠키**로 내려 줍니다.',
      packets: [
        { from: 'route', to: 'bcrypt', kind: 'request', label: 'verify' },
        { from: 'bcrypt', to: 'route', kind: 'response', label: 'true' },
        { from: 'route', to: 'form', kind: 'response', label: 'Set-Cookie' }
      ],
      active: ['route'],
      badges: [{ node: 'form', text: '본문에 토큰 없음', tone: 'good' }],
      metrics: [{ label: '토큰 만료', value: '15분' }]
    }
  ]
}

const MIDDLEWARE: FlowSpec = {
  title: '미들웨어의 서명 검증',
  nodes: [
    { id: 'browser', label: '브라우저', icon: '🌐', x: 0, y: 1.3, tone: 'green' },
    { id: 'mw', label: 'middleware', icon: '🛡️', x: 2, y: 0, tone: 'purple' },
    { id: 'login', label: '/login', icon: '🔑', x: 2, y: 2.6, tone: 'orange' },
    { id: 'page', label: '/dashboard', icon: '📊', x: 4, y: 1.3, tone: 'blue' }
  ],
  edges: [
    { from: 'browser', to: 'mw' },
    { from: 'mw', to: 'login' },
    { from: 'mw', to: 'page' }
  ],
  stages: [
    {
      title: '토큰 없음',
      description: '쿠키가 없으면 `redirectToLogin` 이 원래 경로를 `?from=` 에 담아 로그인 페이지로 보냅니다.',
      packets: [
        { from: 'browser', to: 'mw', kind: 'request', label: 'GET /dashboard' },
        { from: 'mw', to: 'login', kind: 'error', label: '?from=/dashboard' }
      ],
      dimmed: ['page']
    },
    {
      title: '존재만 확인하면',
      description: '쿠키가 **있는지만** 보면 아무 문자열이나 넣어도 통과합니다.',
      packets: [
        { from: 'browser', to: 'mw', kind: 'request', label: 'token=아무거나' },
        { from: 'mw', to: 'page', kind: 'error', label: '통과 (위험)' }
      ],
      failed: ['page'],
      dimmed: ['login'],
      badges: [{ node: 'mw', text: '존재만 확인', tone: 'danger' }],
      metrics: [{ label: '보안', value: '뚫림', tone: 'danger' }]
    },
    {
      title: '위조 토큰 차단',
      description: '`jwtVerify` 로 서명과 만료를 검증하면 위조 토큰은 실패하고, 깨진 쿠키는 지우고 로그인으로 보냅니다.',
      packets: [
        { from: 'browser', to: 'mw', kind: 'request', label: 'token=위조' },
        { from: 'mw', to: 'login', kind: 'error', label: '쿠키 삭제 + 이동' }
      ],
      dimmed: ['page'],
      badges: [{ node: 'mw', text: 'jwtVerify 실패', tone: 'warn' }]
    },
    {
      title: '정상 토큰',
      description: '서명이 맞고 만료 전이면 `NextResponse.next()` 로 원래 페이지를 그대로 보여 줍니다.',
      packets: [
        { from: 'browser', to: 'mw', kind: 'request', label: '서명된 토큰' },
        { from: 'mw', to: 'page', kind: 'response', label: 'next()' },
        { from: 'page', to: 'browser', kind: 'response', label: '200' }
      ],
      dimmed: ['login'],
      badges: [{ node: 'mw', text: '서명 · 만료 확인', tone: 'good' }]
    }
  ]
}

const REFRESH: FlowSpec = {
  title: '401 한 번에 갱신 한 번 (single-flight)',
  nodes: [
    { id: 'screen', label: '화면', icon: '🖼️', x: 0, y: 1.3, tone: 'green' },
    { id: 'fetch', label: 'apiFetch', icon: '🔁', x: 2, y: 0, tone: 'purple' },
    { id: 'refresh', label: '/refresh', icon: '♻️', x: 2, y: 2.6, tone: 'yellow' },
    { id: 'api', label: 'API', icon: '🚪', x: 4, y: 1.3, tone: 'blue' }
  ],
  edges: [
    { from: 'screen', to: 'fetch' },
    { from: 'fetch', to: 'api' },
    { from: 'fetch', to: 'refresh' }
  ],
  stages: [
    {
      title: '동시에 401 세 개',
      description: '액세스 토큰이 만료된 채로 화면이 요청 3개를 동시에 보내, 모두 **401** 을 받습니다.',
      packets: [
        { from: 'fetch', to: 'api', kind: 'request', label: 'A', delay: 0 },
        { from: 'fetch', to: 'api', kind: 'request', label: 'B', delay: 150 },
        { from: 'fetch', to: 'api', kind: 'request', label: 'C', delay: 300 },
        { from: 'api', to: 'fetch', kind: 'error', label: '401', delay: 900 },
        { from: 'api', to: 'fetch', kind: 'error', label: '401', delay: 1050 },
        { from: 'api', to: 'fetch', kind: 'error', label: '401', delay: 1200 }
      ],
      dimmed: ['refresh']
    },
    {
      title: '갱신은 1번만',
      description: '먼저 401 을 받은 요청이 만든 `refreshPromise` 를 나머지가 **함께 기다립니다.** 갱신 요청은 1개만 나갑니다.',
      packets: [
        { from: 'fetch', to: 'refresh', kind: 'request', label: 'refresh' },
        { from: 'refresh', to: 'fetch', kind: 'response', label: '새 쿠키' }
      ],
      active: ['refresh'],
      badges: [{ node: 'fetch', text: 'refreshPromise 공유', tone: 'good' }],
      metrics: [{ label: '갱신 요청', value: '1회', tone: 'good' }]
    },
    {
      title: '한 번씩 재시도',
      description: '세 요청은 **각각 한 번만** 재시도하고, 화면은 끊김 없이 데이터를 받습니다.',
      packets: [
        { from: 'fetch', to: 'api', kind: 'request', label: 'A', delay: 0 },
        { from: 'fetch', to: 'api', kind: 'request', label: 'B', delay: 150 },
        { from: 'fetch', to: 'api', kind: 'request', label: 'C', delay: 300 },
        { from: 'api', to: 'fetch', kind: 'response', delay: 900 },
        { from: 'fetch', to: 'screen', kind: 'response', label: '데이터', delay: 1500 }
      ],
      dimmed: ['refresh'],
      metrics: [{ label: '사용자 체감', value: '끊김 없음', tone: 'good' }]
    },
    {
      title: 'single-flight 가 없으면',
      description: '401 마다 갱신을 보내면 갱신이 3번 나가고, 토큰이 회전(rotation)되는 서버에서는 **서로의 토큰을 무효화**해 로그아웃될 수 있습니다.',
      packets: [
        { from: 'fetch', to: 'refresh', kind: 'request', label: '1', delay: 0 },
        { from: 'fetch', to: 'refresh', kind: 'request', label: '2', delay: 150 },
        { from: 'fetch', to: 'refresh', kind: 'request', label: '3', delay: 300 },
        { from: 'refresh', to: 'fetch', kind: 'error', label: '401', delay: 1000 }
      ],
      failed: ['refresh'],
      badges: [{ node: 'refresh', text: '토큰 회전 충돌', tone: 'danger' }],
      metrics: [{ label: '갱신 요청', value: '3회', tone: 'danger' }]
    },
    {
      title: '갱신 실패',
      description: '갱신 요청 자체가 401 이면 재시도하지 않고 `onSessionExpired()` 로 로그인 페이지에 보냅니다.',
      packets: [
        { from: 'fetch', to: 'refresh', kind: 'request', label: 'refresh' },
        { from: 'refresh', to: 'fetch', kind: 'error', label: '401' },
        { from: 'fetch', to: 'screen', kind: 'error', label: '→ /login' }
      ],
      failed: ['refresh'],
      dimmed: ['api'],
      badges: [{ node: 'fetch', text: '재시도 안 함', tone: 'warn' }]
    }
  ]
}

const OAUTH_PKCE: FlowSpec = {
  title: 'OAuth 2.0 Authorization Code + state + PKCE',
  nodes: [
    { id: 'browser', label: '브라우저', icon: '🌐', x: 0, y: 1.3, tone: 'green' },
    { id: 'app', label: '우리 서버', icon: '🖥️', x: 2, y: 0, tone: 'blue' },
    { id: 'attacker', label: '공격자', icon: '🕵️', x: 2, y: 2.6, tone: 'red' },
    { id: 'github', label: 'GitHub', icon: '🐙', x: 4, y: 1.3, tone: 'gray' }
  ],
  edges: [
    { from: 'browser', to: 'app' },
    { from: 'browser', to: 'github' },
    { from: 'app', to: 'github' },
    { from: 'attacker', to: 'app' }
  ],
  stages: [
    {
      title: '로그인 시작',
      description: '서버가 무작위 `state` 와 `code_verifier` 를 만들어 보관하고, verifier 의 SHA-256 값(`code_challenge`)을 담은 authorize URL 로 보냅니다.',
      packets: [
        { from: 'browser', to: 'app', kind: 'request', label: 'GitHub 로그인' },
        { from: 'app', to: 'browser', kind: 'response', label: 'redirect' }
      ],
      dimmed: ['attacker'],
      badges: [{ node: 'app', text: 'state · verifier 보관' }]
    },
    {
      title: '사용자 동의',
      description: '브라우저가 GitHub 로 이동합니다. GitHub 는 `code_challenge` 를 기억해 둡니다.',
      packets: [{ from: 'browser', to: 'github', kind: 'request', label: 'challenge (S256)' }],
      active: ['github'],
      dimmed: ['attacker'],
      badges: [{ node: 'github', text: 'challenge 기억' }]
    },
    {
      title: '콜백과 state 확인',
      description: 'GitHub 가 `code` 와 `state` 를 붙여 돌려보냅니다. 서버는 **보관한 state 와 같은지** 먼저 확인합니다 (CSRF 방어).',
      packets: [
        { from: 'github', to: 'browser', kind: 'response', label: '?code&state' },
        { from: 'browser', to: 'app', kind: 'request', label: 'callback' }
      ],
      dimmed: ['attacker'],
      badges: [{ node: 'app', text: 'state 일치', tone: 'good' }]
    },
    {
      title: '토큰 교환',
      description: '서버가 `code` 와 원본 `code_verifier` 를 보내면, GitHub 가 해시를 비교해 맞을 때만 토큰을 줍니다.',
      packets: [
        { from: 'app', to: 'github', kind: 'request', label: 'code + verifier' },
        { from: 'github', to: 'app', kind: 'response', label: 'access_token' }
      ],
      active: ['github'],
      dimmed: ['attacker'],
      badges: [{ node: 'github', text: 'SHA256(verifier) = challenge', tone: 'good' }]
    },
    {
      title: 'code 를 가로채도',
      description: '공격자가 `code` 를 가로채도 **verifier 가 없어** 토큰으로 바꿀 수 없습니다.',
      packets: [
        { from: 'attacker', to: 'github', kind: 'error', label: 'code (verifier 없음)' },
        { from: 'github', to: 'attacker', kind: 'error', label: 'invalid_grant' }
      ],
      failed: ['attacker'],
      dimmed: ['browser'],
      metrics: [{ label: '탈취', value: '실패', tone: 'good' }]
    }
  ]
}

export const FRONTEND_FLOWS: Record<string, FlowSpec> = {
  'week-7-1': SERVER_CLIENT_COMPONENTS,
  'week-8-3': USE_QUERY,
  'week-8-4': MUTATION,
  'week-8-5': SSR_PREFETCH,
  'week-9-1': SESSION_VS_TOKEN,
  'week-9-3': LOGIN_API,
  'week-9-5': MIDDLEWARE,
  'week-9-6': REFRESH,
  'week-9-7': OAUTH_PKCE
}
