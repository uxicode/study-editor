import type { CurriculumStep } from '@/types/curriculum'

export const week_6_final: CurriculumStep = {
  id: 'week-6-final',
  title: '6주차 종합 · 최단 경로 탐색기 (BFS Routing)',
  order: 36,
  category: 'advanced',
  content: {
    mission:
      '네트워크 연결 정보를 담은 인접 리스트 `graph`와 출발지 `start`, 목적지 `target`이 주어집니다. 너비 우선 탐색(BFS) 알고리즘을 사용해 출발지에서 목적지까지 도달하는 최단 경로 노드 순서를 배열 형태로 반환하는 `findShortestPathBFS(graph: Record<string, string[]>, start: string, target: string): string[] | null` 함수를 작성하세요. 도달할 수 없는 경우 `null`을 반환합니다.',
    theory: `
      ## 6주차 종합: 너비 우선 탐색(BFS) 기반 라우터 구현

      **너비 우선 탐색(BFS)**은 인접한 노드를 먼저 차례로 탐색하는 방법으로, 가중치가 없는 그래프에서 **최단 경로**를 보장하는 성질을 가지고 있습니다.

      ### 1. BFS 큐(Queue) 구조
      경로 탐색 시 단순히 방문한 노드만 기록하는 것이 아니라, 특정 노드에 이르기까지 거친 전체 경로를 큐에 함께 보관하여 최단 경로 자체를 기억할 수 있습니다:
      \`\`\`ts
      const queue: Array<[string, string[]]> = [[start, [start]]]; // [현재노드, 현재까지경로]
      \`\`\`

      ### 2. BFS 탐색 로직 예제
      \`\`\`ts
      const [current, path] = queue.shift()!;
      if (current === target) return path; // 최단 경로 즉시 반환
      \`\`\`
    `,
    objectives: [
      'FIFO 구조의 큐(배열)를 만들고 shift() 메서드를 사용해 순차 탐색할 것',
      '방문 여부를 확인해 중복 방문을 막을 것',
      '대상 노드를 찾았을 때 거쳐온 경로 배열 전체를 반환하도록 구현할 것'
    ],
    exercise: "1. 주어진 가중치 그래프에서 다익스트라(Dijkstra) 알고리즘을 사용해 시작 노드부터 모든 노드까지의 최단거리를 계산하는 `dijkstra` 함수를 구현하세요.\n2. 방문 여부를 체크하는 Set과 미방문 노드 중 최단거리 노드를 선택해 가는 그리디 탐색 과정을 완성하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function findShortestPathBFS(
  graph: Record<string, string[]>,
  start: string,
  target: string
): string[] | null {
  const queue: Array<[string, string[]]> = [[start, [start]]];
  const visited = new Set<string>([start]);
  
  // BFS 큐와 shift()를 사용해 최단 경로를 구하세요.
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    
    const [current, path] = item;
  }
  
  return null;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.shift(',
        message: '너비 우선 탐색(BFS)을 위해 큐에서 요소를 추출하는 shift() 메서드를 사용해야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /queue\.push\(/,
        message: '다음 탐색할 인접 노드들을 push() 메서드를 사용해 큐에 저장해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '큐 루프 내에서 `current === target`일 때 거쳐온 `path`를 그대로 return 하도록 조건을 추가하세요.'
    },
    {
      level: 2,
      content: '현재 노드의 이웃 노드들을 순회하며 아직 `visited.has(neighbor)`에 걸리지 않은 노드만 `visited.add(neighbor)` 후 `queue.push([neighbor, [...path, neighbor]])` 형태로 큐에 넣으세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function dijkstra(
  graph: Record<number, [number, number][]>,
  start: number,
  numNodes: number
): Record<number, number> {
  const distances: Record<number, number> = {};
  for (let i = 1; i <= numNodes; i++) {
    distances[i] = Infinity;
  }
  distances[start] = 0;
  const visited = new Set<number>();
  while (visited.size < numNodes) {
    let minNode = -1;
    let minDist = Infinity;
    for (let i = 1; i <= numNodes; i++) {
      if (!visited.has(i) && distances[i] < minDist) {
        minDist = distances[i];
        minNode = i;
      }
    }
    if (minNode === -1) break;
    visited.add(minNode);
    const neighbors = graph[minNode] || [];
    for (const [neighbor, weight] of neighbors) {
      const newDist = distances[minNode] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
      }
    }
  }
  return distances;
}`
    }
  ]
}