import type { CurriculumStep } from '@/types/curriculum'

export const week_6_10: CurriculumStep = {
  id: 'week-6-10',
  title: '6주차 · [BFS] 단어 변환 최적화 (가장 표준적인 BFS)',
  order: 40,
  category: 'advanced',
  content: {
    mission: '주제 2의 단어 변환 문제를 BFS로 전환하여 최적화한 `wordTransformationBFS(begin: string, target: string, words: string[]): number` 함수를 구현하세요.',
    theory: `
      ## 최소 깊이 보장
      DFS는 끝까지 깊게 들어가므로, 중간에 일찍 찾더라도 전체 가지를 다 조사해야 비로소 "최소"임을 단정할 수 있습니다. 
      반면 BFS는 최단 깊이부터 순차적으로 탐색하므로 타겟을 만나자마자 즉시 반환(Early Return)하여 높은 효율을 보여줍니다.
    `,
    objectives: [
      'BFS 형태의 큐 구조에 [현재단어, 변환단계] 페어를 저장할 것',
      '한 글자만 다른 인접 단어를 찾아 큐에 삽입하고, 먼저 타겟 단어와 일치하는 원소가 나타나면 즉시 리턴할 것'
    ],
    exercise: "1. 큐에 `[begin, 0]`을 넣고 탐색을 시작하세요.\n2. 한 글자만 차이나는 헬퍼 함수를 구현하고, 큐가 비기 전에 타겟을 리턴하도록 만드세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function wordTransformationBFS(begin: string, target: string, words: string[]): number {
  // BFS를 사용해 최소 변환 단계를 리턴하세요.
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
        pattern: 'wordTransformationBFS',
        message: 'wordTransformationBFS 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /while\s*\(\s*queue\.length/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '큐에서 하나씩 추출하며 `word === target` 확인 절차를 거치세요.'
    },
    {
      level: 2,
      content: '이미 변경했던 단어는 `visited.add(w)` 처리하여 중복 변환 루프를 막으세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function wordTransformationBFS(begin: string, target: string, words: string[]): number {
  if (!words.includes(target)) return 0;
  
  const queue: [string, number][] = [[begin, 0]];
  const visited = new Set<string>([begin]);

  while (queue.length > 0) {
    const [word, steps] = queue.shift()!;

    if (word === target) return steps;

    for (let w of words) {
      if (!visited.has(w) && isNextWord(word, w)) {
        visited.add(w);
        queue.push([w, steps + 1]);
      }
    }
  }
  return 0;

  function isNextWord(w1: string, w2: string): boolean {
    let diff = 0;
    for (let i = 0; i < w1.length; i++) {
      if (w1[i] !== w2[i]) diff++;
    }
    return diff === 1;
  }
}`
    }
  ]
}
