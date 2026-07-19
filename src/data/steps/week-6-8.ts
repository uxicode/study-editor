import type { CurriculumStep } from '@/types/curriculum'

export const week_6_8: CurriculumStep = {
  id: 'week-6-8',
  title: '6주차 · [DFS/백트래킹] 단어 변환 (문자열 그래프 탐색)',
  order: 38,
  category: 'advanced',
  content: {
    mission: '두 개의 단어 `begin`, `target`과 단어 사전 배열 `words`가 주어집니다. 한 번에 단 한 글자만 바꿀 수 있다고 할 때, `begin`에서 `target`으로 변환하기 위한 최소 단계 수를 리턴하는 `wordTransformation(begin: string, target: string, words: string[]): number` 함수를 구현하세요.',
    theory: `
      ## 문자열 그래프 탐색
      단어 사전 내의 단어들을 "노드"로 보고, 한 글자만 다른 관계를 "간선"으로 매핑하는 그래프 탐색 문제입니다.

      ## 풀이 조건
      - 이미 방문한 단어로 순환(Cycle)이 생기는 것을 막기 위해 \`visitedSet\`을 관리합니다.
      - 대상 타겟 단어에 도달하면 최소 가중치(stepCount)를 전역 값과 매칭해 갱신합니다.
    `,
    objectives: [
      '단어 사이의 알파벳 차이가 정확히 1개인지 판별하는 헬퍼 함수를 작성할 것',
      'DFS를 수행하면서 이미 지난 단어는 visited 셋에 추가하고, 재귀 종료 복귀 시 셋에서 제거(백트래킹)할 것'
    ],
    exercise: "1. `words`에 `target`이 없으면 탐색 없이 0을 즉시 반환하세요.\n2. 한 글자 차이나는 다음 단어를 찾아내며 탐색하는 재귀 `dfs(current, steps)` 함수를 구현하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function wordTransformation(begin: string, target: string, words: string[]): number {
  // DFS 탐색을 통해 최소 변환 단계를 리턴하세요. (변환이 불가하면 0)
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
        pattern: 'wordTransformation',
        message: 'wordTransformation 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.delete\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '방문 체크용 `Set` 객체의 `add`와 `delete`를 앞뒤로 감싸 백트래킹을 적용해 주세요.'
    },
    {
      level: 2,
      content: '최소 단계 수이므로 갱신할 타겟 결과의 초기값은 `Infinity`로 잡고 비교하세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function wordTransformation(begin: string, target: string, words: string[]): number {
  if (!words.includes(target)) return 0;
  let minSteps = Infinity;
  const visited = new Set<string>();

  function isOneCharDiff(word1: string, word2: string): boolean {
    let diffCount = 0;
    for (let i = 0; i < word1.length; i++) {
      if (word1[i] !== word2[i]) diffCount++;
    }
    return diffCount === 1;
  }

  function dfs(currentWord: string, stepCount: number) {
    if (currentWord === target) {
      minSteps = Math.min(minSteps, stepCount);
      return;
    }

    for (let word of words) {
      if (!visited.has(word) && isOneCharDiff(currentWord, word)) {
        visited.add(word);
        dfs(word, stepCount + 1);
        visited.delete(word);
      }
    }
  }

  dfs(begin, 0);
  return minSteps === Infinity ? 0 : minSteps;
}`
    }
  ]
}
