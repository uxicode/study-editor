import type { CurriculumStep } from '@/types/curriculum'

export const week_6_7: CurriculumStep = {
  id: 'week-6-7',
  title: '6주차 · [DFS/백트래킹] N-Queen (고급 고난도)',
  order: 37,
  category: 'advanced',
  content: {
    mission: '체스판 크기 `n`이 주어질 때, N개의 퀸이 서로를 공격하지 못하도록 배치하는 경우의 수를 리턴하는 `solveNQueens(n: number): number` 함수를 구현하세요.',
    theory: `
      ## 백트래킹 (Backtracking)
      탐색 과정 중 어떤 유효하지 않은 경로를 마주치면 진행을 중단하고 직전 단계로 회귀하여 다른 대안을 찾아 나가는 효율적 탐색법입니다.

      ## N-Queen 유효성 검증
      - 퀸은 상하좌우 및 모든 대각선으로 사정거리를 갖습니다.
      - 열(Column) 겹침 방지: \`rowPositions[i] === col\`
      - 대각선 겹침 방지: \`Math.abs(rowPositions[i] - col) === row - i\`
    `,
    objectives: [
      '행(row)을 기준으로 DFS 탐색을 한 행씩 순서대로 내려가며 시도할 것',
      '새로 놓을 퀸이 위쪽에 기설치된 다른 퀸들의 사정거리(열, 대각선)와 충돌하는지 체크할 것',
      '안전하지 않다면 가지치기(Pruning)하고, 다른 배치가 끝나고 올라올 때 퀸 위치를 -1로 리셋할 것'
    ],
    exercise: "1. `rowPositions` 배열을 생성하여 각 행에 위치한 퀸의 열 번호를 관리하세요.\n2. 현재 위치가 유효한지 검증하는 `isSafe` 헬퍼 함수와 백트래킹을 적용한 재귀 `dfs` 함수를 구현하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function solveNQueens(n: number): number {
  // N-Queen 배치가 가능한 모든 경우의 수를 계산하여 반환하세요.
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
        pattern: 'solveNQueens',
        message: 'solveNQueens 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /rowPositions.*-1/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '대각선 충돌 체크 시 `Math.abs(rowPositions[i] - col) === row - i` 공식이 참인지 확인하는 것으로 양방향 대각선을 검증할 수 있습니다.'
    },
    {
      level: 2,
      content: '`dfs(row + 1)` 호출 직후 `rowPositions[row] = -1` 처리하여 퀸 배치를 해제(백트래킹)하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function solveNQueens(n: number): number {
  let ways = 0;
  const rowPositions = new Array(n).fill(-1);

  function isSafe(row: number, col: number): boolean {
    for (let i = 0; i < row; i++) {
      if (rowPositions[i] === col || Math.abs(rowPositions[i] - col) === row - i) {
        return false;
      }
    }
    return true;
  }

  function dfs(row: number) {
    if (row === n) {
      ways++;
      return;
    }

    for (let col = 0; col < n; col++) {
      if (isSafe(row, col)) {
        rowPositions[row] = col;
        dfs(row + 1);
        rowPositions[row] = -1;
      }
    }
  }

  dfs(0);
  return ways;
}`
    }
  ]
}
