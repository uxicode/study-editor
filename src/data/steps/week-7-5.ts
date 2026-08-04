import type { CurriculumStep } from '@/types/curriculum'

export const week_7_5: CurriculumStep = {
  id: 'week-7-5',
  title: '7주차 · Next.js 동적 라우팅 및 Route Handler',
  order: 41,
  category: 'advanced',
  content: {
    mission:
      '동적 유저 상세 정보를 JSON 형식으로 제공하는 Next.js Route Handler(`app/api/users/[id]/route.ts`)를 작성하세요.\n- URL 경로 매개변수인 \`id\`를 파싱하여 해당하는 유저 객체를 반환해야 합니다.\n- 매개변수가 존재하지 않거나 찾지 못한 경우 404 상태코드를 담은 \`NextResponse\` 객체를 반환하도록 하세요.',
    theory: `
      ## 1. Route Handler (라우트 핸들러)
      Next.js App Router에서는 \`route.ts\` 파일을 생성하여 REST API 엔드포인트를 구현할 수 있습니다.
      - **지원 메서드**: \`GET\`, \`POST\`, \`PUT\`, \`DELETE\` 등
      
      ## 2. 동적 매개변수 파싱 (Dynamic Route Parameters)
      \`[id]\`와 같이 폴더명이 지정된 동적 경로의 경우, Route Handler의 두 번째 인자인 \`context\` 객체의 \`params\` 필드를 통해 유입 값을 식별할 수 있습니다:
      \`\`\`ts
      import { NextResponse } from 'next/server';

      export async function GET(
        request: Request,
        { params }: { params: { id: string } }
      ) {
        const userId = params.id;
        return NextResponse.json({ id: userId });
      }
      \`\`\`
    `,
    objectives: [
      'Next.js의 NextResponse를 import하여 응답 데이터를 생성할 것',
      'GET 함수 구조 내에 request(첫 번째 인자)와 { params }(두 번째 인자)를 올바르게 정의할 것',
      'params.id 값을 식별하여 NextResponse.json() 형태로 유저 데이터 혹은 에러를 반환할 것'
    ],
    exercise: "1. `app/api/users/[id]/route.ts` 파일에서 Next.js GET Route Handler 함수 구조를 구현하세요.\n2. URL 파라미터 `params.id`로 유저를 검색하고 결과를 `NextResponse.json()`으로 반환하세요."
  },
  initialFiles: [
    {
      name: 'route.ts',
      path: 'app/api/users/[id]/route.ts',
      content: `import { NextResponse } from 'next/server';

const MOCK_USERS: Record<string, { name: string; role: string }> = {
  '1': { name: 'Alice', role: 'admin' },
  '2': { name: 'Bob', role: 'developer' }
};

export async function GET(
  request: Request,
  // 여기에 params 컨텍스트 매개변수를 적절히 정의하세요.
) {
  // id 매칭 정보를 찾아서 반환하고, 없으면 404 에러를 반환하는 로직을 작성하세요.
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'app/api/users/[id]/route.ts',
        pattern: 'params: { id: string }',
        message: 'params 컨텍스트 객체를 { params }: { params: { id: string } } 형태로 지정해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app/api/users/[id]/route.ts',
        pattern: 'MOCK_USERS[',
        message: 'MOCK_USERS 맵에서 ID를 조회하여 데이터를 반환해야 합니다.'
      },
      {
        type: 'includes',
        target: 'app/api/users/[id]/route.ts',
        pattern: 'NextResponse.json(',
        message: '응답을 위해 NextResponse.json() 메서드를 호출해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: 'GET 함수 시그니처를 `export async function GET(request: Request, { params }: { params: { id: string } })` 형태로 수정하세요.'
    },
    {
      level: 2,
      content: '`const user = MOCK_USERS[params.id]` 로 사용자를 조회한 후, `if (!user) return NextResponse.json({ error: "..." }, { status: 404 });`를 반환하고, 사용자가 있으면 `NextResponse.json(user)`로 반환하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `import { NextResponse } from 'next/server';

const MOCK_USERS: Record<string, { name: string; role: string }> = {
  '1': { name: 'Alice', role: 'admin' },
  '2': { name: 'Bob', role: 'developer' }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = MOCK_USERS[params.id];
  if (!user) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
  return NextResponse.json(user);
}`
    }
  ]
}