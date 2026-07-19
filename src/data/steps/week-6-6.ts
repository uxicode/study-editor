import type { CurriculumStep } from '@/types/curriculum'

export const week_6_6: CurriculumStep = {
  id: 'week-6-6',
  title: '6주차 · [DFS] 타겟 넘버 (트리 구조 탐색)',
  order: 36,
  category: 'advanced',
  content: {
    mission: '정수 배열 `numbers`와 목표값 `target`이 주어질 때, 순서를 유지한 채 각 숫자를 더하거나 빼서 `target`을 만드는 경우의 수를 계산하는 `findTargetNumber(numbers: number[], target: number): number` 함수를 작성하세요.',
    theory: `
      ## 상태 공간 트리 탐색
      각 단계마다 두 가지 선택지(더하기 혹은 빼기)가 주어지는 깊이 N인 상태 트리를 완벽히 탐색하는 이진 결정 트리 풀이 패턴입니다.

      ## 재귀 구조 설계
      - 단계를 가리키는 \`index\`가 \`numbers.length\`와 같아지면 단계를 모두 거친 상태입니다.
      - 이 시점에 \`currentSum\`이 \`target\`과 동일하면 정답 경우의 수를 누적합니다.
    `,
    objectives: [
      '재귀 DFS 호출 시 다음 단계 인덱스와 누적 합을 파라미터로 넘길 것',
      '리프 노드 도달 시 합이 target과 일치하는 경우의 수를 누적 반환할 것'
    ],
    exercise: "1. `dfs(0, 0)`으로 시작하는 DFS 재귀 함수를 내부에 선언하세요.\n2. 인덱스가 리스트 끝까지 도달했을 때 누적 합이 target과 일치하면 카운트를 올리도록 처리하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function findTargetNumber(numbers: number[], target: number): number {
  // DFS 재귀를 활용하여 타겟 숫자를 만드는 경우의 수를 리턴하세요.
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
        pattern: 'findTargetNumber',
        message: 'findTargetNumber 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /dfs\s*\(\s*index\s*\+\s*1/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '재귀 호출 시 하나는 더하는 분기 `dfs(index + 1, currentSum + numbers[index])`, 다른 하나는 빼는 분기 `dfs(index + 1, currentSum - numbers[index])` 두 개를 호출하세요.'
    },
    {
      level: 2,
      content: '함수 밖 스코프의 변수(예: `answer`)를 활용해 최종 정답 수량을 누적하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function findTargetNumber(numbers: number[], target: number): number {
  let answer = 0;

  function dfs(index: number, currentSum: number) {
    if (index === numbers.length) {
      if (currentSum === target) answer++;
      return;
    }

    dfs(index + 1, currentSum + numbers[index]);
    dfs(index + 1, currentSum - numbers[index]);
  }

  dfs(0, 0);
  return answer;
}`
    }
  ]
}
