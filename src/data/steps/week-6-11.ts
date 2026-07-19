import type { CurriculumStep } from '@/types/curriculum'

export const week_6_11: CurriculumStep = {
  id: 'week-6-11',
  title: '6주차 · [BFS] 토마토 농장 (Multi-Source BFS, 중급)',
  order: 41,
  category: 'advanced',
  content: {
    mission: '익은 토마토(1), 안 익은 토마토(0), 빈 칸(-1)이 배치된 2차원 배열 격자 `grid`가 주어집니다. 창고의 토마토들이 전부 익을 때까지 걸리는 최소 일수를 리턴하는 `tomatoFarm(grid: number[][]): number` 함수를 작성하세요.',
    theory: `
      ## 다중 출발지 BFS (Multi-Source BFS)
      출발점이 하나가 아니라 여러 노드에서 동시에 시작되는 전파 연산 유형입니다. 
      초기 상태의 모든 활성 출발지(값 1)를 큐에 먼저 한꺼번에 밀어 넣고 한 단계씩 큐 루프를 소모해야 동시적인 최단 전파 시간이 계산됩니다.
    `,
    objectives: [
      '격자판 내의 모든 익은 토마토 좌표를 초기 큐에 넣고 시작할 것',
      '큐를 소모하면서 4방향 범위를 체크해 안 익은 토마토(0)를 익음(1) 상태로 수정할 것',
      '전체 완료 단계(days)를 카운팅하되 안 익은 토마토가 남는 경우 -1을 낼 것'
    ],
    exercise: "1. 이중 루프를 돌아 초기 상태 of 익은 토마토(1)는 큐에 `[r, c, 0]`으로 적재하고, 익지 않은 토마토(0) 개수를 세세요.\n2. 상하좌우 오프셋 배열(dr, dc)을 이용하여 4방향 전파 시뮬레이션을 구현하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function tomatoFarm(grid: number[][]): number {
  // Multi-Source BFS를 사용해 최소 일수를 리턴하세요.
  return -1;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'tomatoFarm',
        message: 'tomatoFarm 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /dr\s*=\s*\[/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '토마토가 전파되어 익게 되면 `unripened--` 처리를 해주어 미수금 토마토 수량을 실시간 감축하세요.'
    },
    {
      level: 2,
      content: '큐 루프가 다 돌았을 때 `unripened === 0` 조건을 확인해 최종 소요일(maxDays)을 판단하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function tomatoFarm(grid: number[][]): number {
  const R = grid.length;
  const C = grid[0].length;
  const queue: [number, number, number][] = [];
  let unripened = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) queue.push([r, c, 0]);
      else if (grid[r][c] === 0) unripened++;
    }
  }

  if (unripened === 0) return 0;
  let maxDays = 0;
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (queue.length > 0) {
    const [r, c, days] = queue.shift()!;
    maxDays = days;

    for (let i = 0; i < 4; i++) {
      const nr = r + dr[i];
      const nc = c + dc[i];

      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] === 0) {
        grid[nr][nc] = 1;
        unripened--;
        queue.push([nr, nc, days + 1]);
      }
    }
  }
  return unripened === 0 ? maxDays : -1;
}`
    }
  ]
}
