import type { CurriculumStep } from '@/types/curriculum'

export const week_6_12: CurriculumStep = {
  id: 'week-6-12',
  title: '6주차 · [BFS] 게임 맵 최단거리 (장애물 회피 매트릭스)',
  order: 42,
  category: 'advanced',
  content: {
    mission: '0(벽)과 1(길)로 지정된 격자 맵 `maps`가 주어질 때, 좌상단 `(0,0)`에서 우하단 끝점까지 가기 위해 거치는 최단 칸 수를 구하는 `shortestPathInGrid(maps: number[][]): number` 함수를 완성하세요.',
    theory: `
      ## 최단 격자 탈출로 탐색
      기본적인 미로 탐색은 4방향 오프셋 배열을 매핑한 루프를 통해 이웃 칸으로 나아가며, 최단 탐색이 보장되는 BFS의 핵심 활용 패턴 중 하나입니다.
      - 큐에 인입되는 시점에 방문 표시를 남기거나 벽(0)으로 메워 중복 큐 진입을 사전에 차단합니다.
    `,
    objectives: [
      '시작점에서 우측 최하단 지점(n-1, m-1)에 도달할 때까지 탐색을 계속할 것',
      '이미 들어간 경로는 maps상의 값을 0으로 덮어씌워 중복 연산을 제거할 것'
    ],
    exercise: "1. 큐에 `[0, 0, 1]` 형태로 초기 위치와 칸 수 1을 넣고 시작하세요.\n2. 상하좌우 탐색을 통해 목적지 인덱스에 도달하면 즉시 소요 칸 수(cost)를 반환하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function shortestPathInGrid(maps: number[][]): number {
  // BFS를 사용해 좌상단에서 우하단 끝까지의 최단 칸 수를 구하세요. (도달 불가시 -1)
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
        pattern: 'shortestPathInGrid',
        message: 'shortestPathInGrid 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /maps\.length/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '큐에 넣기 직전에 바로 `maps[nr][nc] = 0` 처리를 해야 큐에 중복 좌표가 쏠려 메모리가 폭발하는 문제를 방어할 수 있습니다.'
    },
    {
      level: 2,
      content: '큐가 완전히 빌 때까지 리턴되지 않으면 막혀 있는 상태이므로 -1을 내보내세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function shortestPathInGrid(maps: number[][]): number {
  const n = maps.length;
  const m = maps[0].length;
  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];
  
  const queue: [number, number, number][] = [[0, 0, 1]];
  maps[0][0] = 0;

  while (queue.length > 0) {
    const [r, c, cost] = queue.shift()!;

    if (r === n - 1 && c === m - 1) return cost;

    for (let i = 0; i < 4; i++) {
      const nr = r + dr[i];
      const nc = c + dc[i];

      if (nr >= 0 && nr < n && nc >= 0 && nc < m && maps[nr][nc] === 1) {
        maps[nr][nc] = 0;
        queue.push([nr, nc, cost + 1]);
      }
    }
  }
  return -1;
}`
    }
  ]
}
