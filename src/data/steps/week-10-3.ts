import type { CurriculumStep } from '@/types/curriculum'
import { codeNote } from './interview-shared'

export const week_10_3: CurriculumStep = {
  id: 'week-10-3',
  title: '면접 1주차 · 엣지 케이스와 검증 — 목록 페이지네이션',
  order: 303,
  category: 'advanced',
  content: {
    mission: '정상 입력만 처리하는 코드에서 멈추지 않고, 경계값과 잘못된 입력을 스스로 찾아 처리하고 검증하는 과정을 보여 줍니다.',
    theory: `
## "다 짰습니다" 다음에 해야 할 말

면접관은 구현이 끝난 뒤 거의 항상 "이 코드가 맞다는 걸 어떻게 확인하죠?" 라고 묻습니다.
먼저 말하면 그 자체로 가산점입니다.

> "정상 입력 하나, 경계값 두 개, 잘못된 입력 하나로 확인해 보겠습니다."

## 엣지 케이스를 찾는 체크리스트

| 분류 | 페이지네이션에서의 예 |
|---|---|
| **비어 있음** | 목록이 0개 |
| **경계** | 첫 페이지, 마지막 페이지, 나누어떨어지지 않는 마지막 페이지 |
| **범위 밖** | 0페이지, 음수, 전체 페이지보다 큰 번호 |
| **형식 오류** | 소수(2.7), 0 이하의 페이지 크기 |

## 웹에서 왜 중요한가

페이지 번호는 대부분 **URL 쿼리(\`?page=999\`)** 로 들어옵니다. 사용자가 직접 고칠 수 있으므로,
서버든 프론트든 "범위 밖 입력이 와도 화면이 깨지지 않게" 처리해야 합니다.
에러를 던질지, 가장 가까운 유효값으로 보정할지는 **요구사항으로 확인**할 대상입니다.
    `,
    objectives: [
      '빈 목록, 경계, 범위 밖, 형식 오류 입력을 분류해 처리한다',
      '반환 객체의 모든 필드(items, page, totalPages, hasNext)를 정확히 계산한다',
      '어떤 입력으로 검증했는지 설명한다'
    ],
    exercise: `
**상황**
게시판 목록 화면에서 사용자가 주소창에 \`?page=999\` 를 넣자 빈 화면과 함께 "다음" 버튼이 활성화되는 버그가 신고됐습니다. 목록을 잘라 주는 함수를 다시 만들어 달라는 요청을 받았습니다.

**요구사항** (\`paginate(items: string[], page: number, pageSize: number)\`)
1. 반환값은 \`{ items, page, totalPages, hasNext }\` 이며, **이 순서로** 키를 만듭니다.
2. \`page\` 는 1부터 시작합니다. 소수는 내림합니다. 1보다 작으면 1, 전체 페이지보다 크면 마지막 페이지로 보정합니다.
3. \`pageSize\` 가 1보다 작으면 기본값 10을 사용합니다.
4. 목록이 비어 있으면 \`{ items: [], page: 1, totalPages: 0, hasNext: false }\` 를 반환합니다.
5. \`hasNext\` 는 보정된 페이지 뒤에 페이지가 더 있을 때만 \`true\` 입니다.

**생각해 보기** (\`//\` 주석으로 작성)
- \`// 엣지 케이스:\` 위 규칙 외에 추가로 떠올린 입력
- \`// 테스트:\` 직접 대입해 본 입력과 기대 결과를 한 줄로
    `.trim(),
    expectedOutput: '목록 페이지네이션 — 모든 채점 항목 통과'
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      language: 'typescript',
      content: `// 엣지 케이스:
// 테스트:
export interface PageResult {
  items: string[];
  page: number;
  totalPages: number;
  hasNext: boolean;
}

export function paginate(items: string[], page: number, pageSize: number): PageResult {
  // 요구사항에 맞게 목록을 잘라 반환하세요.
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    totalPages: Math.ceil(items.length / pageSize),
    hasNext: true
  };
}
`
    }
  ],
  validator: {
    staticChecks: [
      codeNote('index.ts', '엣지 케이스', '추가로 떠올린 엣지 케이스를 // 엣지 케이스: 주석으로 적어야 합니다.'),
      codeNote('index.ts', '테스트', '직접 대입해 본 입력과 기대 결과를 // 테스트: 주석으로 적어야 합니다.')
    ],
    dynamicChecks: [],
    functionTests: [
      {
        target: 'index.ts',
        functionName: 'paginate',
        cases: [
          {
            description: '첫 페이지',
            args: [['a', 'b', 'c', 'd', 'e'], 1, 2],
            expected: { items: ['a', 'b'], page: 1, totalPages: 3, hasNext: true }
          },
          {
            description: '나누어떨어지지 않는 마지막 페이지',
            args: [['a', 'b', 'c', 'd', 'e'], 3, 2],
            expected: { items: ['e'], page: 3, totalPages: 3, hasNext: false }
          },
          {
            description: '전체보다 큰 페이지는 마지막 페이지로 보정',
            args: [['a', 'b', 'c', 'd', 'e'], 999, 2],
            expected: { items: ['e'], page: 3, totalPages: 3, hasNext: false }
          },
          {
            description: '0 이하 페이지는 1로 보정',
            args: [['a', 'b', 'c', 'd', 'e'], 0, 2],
            expected: { items: ['a', 'b'], page: 1, totalPages: 3, hasNext: true }
          },
          {
            description: '소수 페이지는 내림',
            args: [['a', 'b', 'c', 'd', 'e'], 2.7, 2],
            expected: { items: ['c', 'd'], page: 2, totalPages: 3, hasNext: true }
          },
          {
            description: '빈 목록',
            args: [[], 3, 10],
            expected: { items: [], page: 1, totalPages: 0, hasNext: false }
          },
          {
            description: '잘못된 페이지 크기는 기본값 10',
            args: [['a', 'b', 'c', 'd', 'e'], 1, 0],
            expected: { items: ['a', 'b', 'c', 'd', 'e'], page: 1, totalPages: 1, hasNext: false }
          }
        ]
      }
    ]
  },
  hints: [
    {
      level: 1,
      content: '순서가 중요합니다. ① pageSize 보정 → ② totalPages 계산 → ③ 빈 목록 처리 → ④ page 내림과 1 ~ totalPages 범위 보정 → ⑤ slice 와 hasNext 계산.'
    },
    {
      level: 2,
      content: `채점 항목:
- // 엣지 케이스:, // 테스트: 주석
- paginate 함수 테스트 7개 (첫/마지막 페이지, 범위 밖 보정, 소수, 빈 목록, 잘못된 pageSize)`
    },
    {
      level: 3,
      content: '정답 예시입니다.',
      codeSnippet: `// 엣지 케이스: page 가 NaN 이면 1 로 보고, 목록 길이가 pageSize 로 정확히 나누어떨어질 때 마지막 페이지의 hasNext 를 확인했습니다.
// 테스트: paginate(['a','b','c','d','e'], 999, 2) → { items: ['e'], page: 3, totalPages: 3, hasNext: false }
export interface PageResult {
  items: string[];
  page: number;
  totalPages: number;
  hasNext: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

export function paginate(items: string[], page: number, pageSize: number): PageResult {
  const size = pageSize >= 1 ? Math.floor(pageSize) : DEFAULT_PAGE_SIZE;
  const totalPages = Math.ceil(items.length / size);

  if (totalPages === 0) {
    return { items: [], page: 1, totalPages: 0, hasNext: false };
  }

  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const current = Math.min(Math.max(requested, 1), totalPages);
  const start = (current - 1) * size;

  return {
    items: items.slice(start, start + size),
    page: current,
    totalPages,
    hasNext: current < totalPages
  };
}
`
    }
  ]
}
