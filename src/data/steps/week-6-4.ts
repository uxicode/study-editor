import type { CurriculumStep } from '@/types/curriculum'

export const week_6_4: CurriculumStep = {
  id: 'week-6-4',
  title: '6주차 · 그래프 및 깊이 우선 탐색 (DFS)',
  order: 34,
  category: 'advanced',
  content: {
    mission:
      '인접 리스트 형식의 그래프 `graph`와 시작 노드 `start`, 대상 노드 `target`이 주어집니다. 시작 노드에서 깊이 우선 탐색(DFS)을 시작하여 대상 노드에 도달할 수 있는지 여부를 판단하는 `hasPathDFS(graph: Record<string, string[]>, start: string, target: string, visited?: Set<string>): boolean` 함수를 작성하세요. 재귀(Recursion) 호출을 사용해 구현하세요.',
    theory: `
      ## 1. 그래프 탐색
      그래프(Graph)는 노드(Node, 정점)와 노드를 잇는 간선(Edge)의 집합입니다. 그래프의 모든 노드를 체계적으로 방문하는 방법으로는 크게 DFS와 BFS가 있습니다.

      ## 2. 깊이 우선 탐색 (DFS, Depth-First Search)
      한 경로를 끝까지 탐색하고 더 이상 갈 수 없으면 이전 갈림길로 돌아가 다른 경로를 탐색하는 방법입니다.
      - **구현 방법**: 주로 **재귀 함수**나 **명시적인 스택**을 사용하여 구현합니다.
      - 무한 루프에 빠지지 않도록 이미 방문한 노드를 기억하는 **방문(visited) 테이블/셋**이 필수적입니다.
    `,
    objectives: [
      '방문 여부를 확인하기 위한 Set을 관리하고, 새로운 방문 노드를 추가할 것',
      '인접 노드에 대해 재귀적으로 hasPathDFS를 호출하여 경로 유무를 판별할 것'
    ],
    exercise: "1. BFS(너비 우선 탐색)를 활용하여 최단 경로 길이를 계산하는 `shortestPath` 함수를 완성하세요.\n2. 인접 리스트 형식의 그래프와 큐(Queue) 자료구조를 생성하여 탐색 과정을 구현하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function hasPathDFS(
  graph: Record<string, string[]>,
  start: string,
  target: string,
  visited: Set<string> = new Set()
): boolean {
  // DFS 알고리즘을 사용해 start 노드에서 target 노드로 가는 경로 유무를 구하세요.
  if (start === target) return true;
  if (visited.has(start)) return false;
  
  visited.add(start);
  
  return false;
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'hasPathDFS(',
        message: '재귀 호출을 위해 함수 내부에서 hasPathDFS()를 다시 호출해야 합니다.'
      },
      {
        type: 'includes',
        target: 'index.ts',
        pattern: '.has(',
        message: '방문 체크를 위해 Set의 has() 메서드를 사용해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '현재 `start` 노드의 이웃 노드들을 `graph[start]`로 가져온 뒤, 이웃들 중 하나라도 `hasPathDFS(graph, neighbor, target, visited)`가 `true`를 반환하면 최종적으로 `true`를 반환해야 합니다.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function shortestPath(graph: Record<number, number[]>, start: number, target: number): number {
  if (start === target) return 0;
  const queue: [number, number][] = [[start, 0]];
  const visited = new Set<number>([start]);
  while (queue.length > 0) {
    const [node, dist] = queue.shift()!;
    if (node === target) return dist;
    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
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