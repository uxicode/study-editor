import type { CurriculumStep } from '@/types/curriculum'

export const week_6_9: CurriculumStep = {
  id: 'week-6-9',
  title: '6주차 · [BFS] 네트워크 최소 호프(Hop) 수 탐색 (기본)',
  order: 39,
  category: 'advanced',
  content: {
    mission: '컴퓨터 연결 정보를 담은 2차원 인접 행렬 `graph`와 `start`, `target` 컴퓨터가 주어질 때, 최소 연결 노드(Hop) 개수를 구하는 `minHopDistance(graph: number[][], start: number, target: number): number` 함수를 작성하세요. (도달 불가시 -1)',
    theory: `
      ## 너비 우선 탐색 (BFS)
      BFS는 **가까운 노드부터 차례대로** 넓게 탐색해 나가는 알고리즘입니다. 가중치가 1인 무방향 그래프에서 출발지부터 목적지까지의 "최단 경로"를 찾는 데 있어 정석적인 해법입니다.

      ## 큐(Queue)를 이용한 최단 경로 탐색
      - 큐에 \`[현재노드, 누적거리]\` 구조를 저장해 둡니다.
      - 큐에서 하나씩 꺼내 이웃 노드를 탐색하고, 처음 도달한 깊이가 최단 거리가 됩니다.
    `,
    objectives: [
      '큐에 현재 노드 인덱스와 최단 거리를 페어로 담아 관리할 것',
      '이웃 노드 중 연결되어 있으며 방문한 적이 없는 경우 큐에 적재하고 거리를 +1 시킬 것'
    ],
    exercise: "1. `queue` 배열에 `[start, 0]`을 넣어 초기화하고, 방문 셋을 구성하세요.\n2. 큐가 빌 때까지 돌며 목적지 `target`에 닿으면 거리를 즉시 반환하는 루프를 구성하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function minHopDistance(graph: number[][], start: number, target: number): number {
  // BFS를 사용해 최소 호프 거리를 구하세요.
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
        pattern: 'minHopDistance',
        message: 'minHopDistance 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.shift\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '큐에서 원소를 꺼낼 때 `const [node, dist] = queue.shift()!` 처럼 구조 분해 할당을 사용하세요.'
    },
    {
      level: 2,
      content: '인접 행렬의 이웃 체크는 `graph[node][neighbor] === 1` 조건으로 수행할 수 있습니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function minHopDistance(graph: number[][], start: number, target: number): number {
  const queue: [number, number][] = [[start, 0]];
  const visited = new Set<number>([start]);

  while (queue.length > 0) {
    const [node, dist] = queue.shift()!;

    if (node === target) return dist;

    for (let neighbor = 0; neighbor < graph[node].length; neighbor++) {
      if (graph[node][neighbor] === 1 && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
  return -1;
}`
    }
  ]
}
