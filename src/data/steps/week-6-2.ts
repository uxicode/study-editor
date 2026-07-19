import type { CurriculumStep } from '@/types/curriculum'

export const week_6_2: CurriculumStep = {
  id: 'week-6-2',
  title: '6주차 · [스택] 일일 온도 — Monotonic Stack (고급)',
  order: 32,
  category: 'advanced',
  content: {
    mission: '매일의 온도가 담긴 배열 `T`가 주어집니다. 각 날짜마다 더 따뜻한 날씨를 맞이하기까지 며칠을 더 기다려야 하는지 담은 배열을 반환하는 `dailyTemperatures(T: number[]): number[]` 함수를 작성하세요. (더 따뜻해지는 날이 없다면 0)',
    theory: `
      ## 단조 스택(Monotonic Stack)
      스택 내부의 원소들을 오름차순 또는 내림차순 상태로 유지하는 기법입니다. 다음으로 더 큰/작은 원소를 찾아내는 인덱스 거리를 O(N)으로 해결하는 데 매우 유용합니다.

      ## 일일 온도 풀이 흐름
      - 온도의 **인덱스**를 스택에 차례대로 담습니다.
      - 현재 날짜의 온도가 스택 탑 인덱스의 온도보다 높다면, 스택 탑 인덱스를 pop하고 대기 기간(\`현재인덱스 - 이전인덱스\`)을 계산해 결과에 적재합니다.
    `,
    objectives: [
      '단조 감소 형태의 온도를 추적하기 위해 스택에 날짜 인덱스를 푸시할 것',
      '현재 날씨가 이전 날씨보다 온도가 높으면 스택에서 인덱스를 pop하여 일수 차이를 누적 기록할 것'
    ],
    exercise: "1. 결과 배열을 입력 배열 T와 같은 길이로 생성하고 0으로 채우세요.\n2. 온도가 높아지는 시점을 단조 스택으로 찾아내어 인덱스 거리 값을 입력하고 리턴하세요."
  },
  initialFiles: [
    {
      name: 'index.ts',
      path: 'index.ts',
      content: `export function dailyTemperatures(T: number[]): number[] {
  // Monotonic Stack을 활용해 더 따뜻해지는 대기 일수를 리턴하세요.
  return [];
}`,
      language: 'typescript'
    }
  ],
  validator: {
    staticChecks: [
      {
        type: 'includes',
        target: 'index.ts',
        pattern: 'dailyTemperatures',
        message: 'dailyTemperatures 구현이 포함되어야 합니다.'
      },
      {
        type: 'regex',
        target: 'index.ts',
        pattern: /\.pop\(/,
        message: '알고리즘의 올바른 구현 규칙을 준수해야 합니다.'
      }
    ],
    dynamicChecks: []
  },
  hints: [
    {
      level: 1,
      content: '스택에는 온도가 아닌 날짜의 인덱스(`i`)를 넣어야 거리 연산이 수월합니다.'
    },
    {
      level: 2,
      content: '`while (stack.length > 0 && T[i] > T[stack[stack.length - 1]])` 구조를 적용해 보세요.'
    },
    {
      level: 3,
      content: '정답 코드 예시입니다.',
      codeSnippet: `export function dailyTemperatures(T: number[]): number[] {
  const result = new Array(T.length).fill(0);
  const stack: number[] = [];

  for (let i = 0; i < T.length; i++) {
    while (stack.length > 0 && T[i] > T[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!;
      result[prevIndex] = i - prevIndex;
    }
    stack.push(i);
  }
  return result;
}`
    }
  ]
}
