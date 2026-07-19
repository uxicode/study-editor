import type { CurriculumStep } from '@/types/curriculum'

export const week_6_5: CurriculumStep = {
  id: 'week-6-5',
  title: '6주차 · [DFS] 섬의 개수 구하기 (기본 행렬 탐색)',
  order: 35,
  category: 'advanced',
  content: {
    mission: '1(땅)과 0(바다)으로 구성된 2차원 문자열 그리드 맵 `grid`가 주어질 때, 상하좌우로 연결된 섬의 총 개수를 반환하는 `numIslands(grid: string[][]): number` 함수를 작성하세요.',
    theory: `
      ## 깊이 우선 탐색 (DFS)
      DFS는 **가장 깊은 곳까지** 탐색을 시도한 다음 더 이상 갈 곳이 없을 때 복귀하는 그래프 탐색 알고리즘입니다. 2차원 격자판에서 상하좌우 연결 컴포넌트(Connected Component)를 분류할 때 널리 쓰입니다.

      ## 섬 탐색 알고리즘
      - 이중 루프로 그리드를 돌며 \`'1'\`(땅)을 찾습니다.
      - 땅을 발견하면 섬 개수를 1 늘리고, 재귀 DFS 함수를 호출해 연결된 모든 땅을 \`'0'\`(바다)으로 가라앉히며 방문 처리합니다.
    `,
    objectives: [
      '2차원 배열 격자 루프 도중 땅(\'1\')을 찾으면 섬 카운트를 올리고 DFS를 가동할 것',
      'DFS 진입 시 범위를 벗어나거나 바다(\'0\')를 만나면 재귀 호출을 멈출 것',
      '방문한 좌표의 값은 중복 방문 방지를 위해 \'0\'으로 덮어쓸 것'
    ],
    exercise: "1. `numIslands` 함수 내부에서 격자판의 섬 개수를 추적하는 변수를 선언하세요.\n2. 재귀적인 `dfs(r, c)` 함수를 선언해 상하좌우 연결 상태 땅을 지우는 연산을 완성하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function numIslands(grid: string[][]): number {
  // DFS를 활용하여 상하좌우 연결된 섬의 개수를 리턴하세요.
  return 0;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'numIslands',
        message: 'numIslands 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /function\s+dfs/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: 'dfs 함수 호출 시 경계 조건 검사 `r < 0 || c < 0 || r >= grid.length || c >= grid[0].length` 를 잊지 마세요.'
    },
    {
      level: 2,
      content: '이미 방문한 땅은 `grid[r][c] = \'0\'` 처럼 바다로 바꿔 재귀 방문이 무한히 돌지 않게 차단해야 합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function numIslands(grid: string[][]): number {
  if (!grid || grid.length === 0) return 0;
  let islandCount = 0;

  function dfs(r: number, c: number) {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] === '0') {
      return;
    }
    grid[r][c] = '0';

    dfs(r - 1, c);
    dfs(r + 1, c);
    dfs(r, c - 1);
    dfs(r, c + 1);
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === '1') {
        islandCount++;
        dfs(r, c);
      }
    }
  }
  return islandCount;
}`
    }
  ]
}
